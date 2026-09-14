import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const officialDomainsByStack = {
  typescript: ['typescriptlang.org', 'react.dev'],
  nextjs: ['nextjs.org', 'react.dev', 'vercel.com'],
};

const stackProfiles = {
  nextjs: {
    label: 'Next.js',
    requiredStages: [
      { name: '프로젝트 환경 세팅', pattern: /(create-next-app|프로젝트\s*세팅|환경\s*세팅|초기\s*설정|프로젝트\s*생성|설치|next\.config|app\s*router)/i },
      { name: '사이트 구축', pattern: /(사이트|페이지|라우팅|상품|주문|관리자|대시보드|폼|로그인|상세\s*페이지|목록\s*페이지)/i },
      { name: '배포와 운영 확인', pattern: /(배포|운영|production|환경\s*변수|로그|모니터링|빌드\s*실패|캐시\s*무효화|SEO|metadata)/i },
    ],
  },
};

function usage() {
  return 'Usage: node scripts/verify-curriculum-quality.mjs [--fixture <file>]';
}

function parseArgs(argv) {
  if (argv.length === 0) return { mode: 'project' };
  if (argv.length === 2 && argv[0] === '--fixture') return { mode: 'fixture', path: resolve(root, argv[1]) };
  throw new Error(usage());
}

async function loadProjectLessons() {
  // Load the same trusted repository catalog as the app, including helper calls
  // and published subsets. Never evaluate learner submissions here.
  const entry = resolve(root, 'src/curriculum/index.ts');
  const result = await build({
    entryPoints: [entry], bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{
      name: 'curriculum-files',
      setup(builder) {
        // Resolve local catalog modules explicitly; avoid parent-directory
        // package discovery in restricted Windows workspaces.
        builder.onResolve({ filter: /.*/ }, (args) => {
          if (args.kind === 'entry-point') return { path: entry, namespace: 'curriculum' };
          if (!args.path.startsWith('.')) throw new Error('Curriculum imports must be relative: ' + args.path);
          return { path: resolve(dirname(args.importer), args.path.replace(/\.js$/, '.ts')), namespace: 'curriculum' };
        });
        builder.onLoad({ filter: /.*/, namespace: 'curriculum' }, (args) => ({
          contents: readFileSync(args.path, 'utf8'), loader: 'ts',
        }));
      },
    }],
  });
  const { lessons, course } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
  if (!Array.isArray(lessons)) throw new Error('Published lessons must be an array.');
  return { stack: 'typescript', course, lessons: lessons.map((lesson) => ({
    ...lesson, sourceFile: relative(root, entry),
    hasStarter: lesson?.starter != null && typeof lesson.starter === 'object' && !Array.isArray(lesson.starter),
    hasSolution: lesson?.solution != null && typeof lesson.solution === 'object' && !Array.isArray(lesson.solution),
  })) };
}

function isOfficialSource(value, domains) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password
      && domains.some((domain) => url.hostname === domain || url.hostname.endsWith('.' + domain));
  } catch { return false; }
}

function loadFixture(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return { stack: data.stack, course: data.course, lessons: data.lessons.map((lesson) => ({ ...lesson, sourceFile: relative(root, path) })) };
}

function textOf(lesson) {
  return [lesson.title, lesson.summary, lesson.story, lesson.mission, ...(lesson.concept ?? []), ...(lesson.goals ?? []), ...(lesson.hints ?? []), ...(lesson.explanation ?? [])].filter(Boolean).join('\n');
}

function fail(failures, lesson, message) {
  failures.push(`${lesson.sourceFile ?? 'fixture'}:${lesson.id ?? '?'} ${message}`);
}

function validateCommon(stack, lessons) {
  const failures = [];
  const practicalWords = /(API|DB|서버|화면|사용자|상품|주문|검색|폼|로그인|배포|운영|페이지|컴포넌트|브라우저|캐시|테스트|요청|응답|프로필|결제|관리자|CSV|이벤트|알림|채널|reducer|Context|모듈|라이브러리)/i;
  const officialDomains = officialDomainsByStack[stack] ?? [];

  for (const lesson of lessons) {
    if (lesson.kind === 'diagnostic') continue;
    if (!lesson.title || lesson.title.length < 4) fail(failures, lesson, '제목이 학습 주제를 보여주지 않습니다.');
    if (/\b(first|parseRow|mapItems|cacheKey|hasField|getField|sendChannel|Counter|Button)\b.*(함수|컴포넌트)/.test(lesson.title ?? '')) {
      fail(failures, lesson, '제목에서 예제 이름이 학습 주제처럼 쓰였습니다.');
    }
    if (!lesson.summary || lesson.summary.length < 45) fail(failures, lesson, '요약이 너무 짧아 학습 내용을 파악하기 어렵습니다.');
    if (!lesson.story || lesson.story.length < 80) fail(failures, lesson, '실무 상황 설명이 너무 짧습니다.');
    if (lesson.story && !practicalWords.test(lesson.story)) fail(failures, lesson, '실무에서 언제 쓰는지 알 수 있는 상황 단어가 없습니다.');
    if ((lesson.concept ?? []).length < 2) fail(failures, lesson, '개념 설명은 최소 2개 문단이 필요합니다.');
    if ((lesson.concept ?? []).join('').length < 80) fail(failures, lesson, '개념 설명의 깊이가 부족합니다.');
    if (!lesson.mission || lesson.mission.length < 20) fail(failures, lesson, '과제가 무엇을 고치는지 충분히 말하지 않습니다.');
    if ((lesson.goals ?? []).length < 2) fail(failures, lesson, '학습 목표가 부족합니다.');
    if ((lesson.hints ?? []).length < 2) fail(failures, lesson, '힌트가 부족합니다.');
    if ((lesson.explanation ?? []).length < 1) fail(failures, lesson, '통과 후 설명이 필요합니다.');
    if (lesson.kind === 'practice' && (lesson.hasStarter !== true || lesson.hasSolution !== true)) fail(failures, lesson, '실습 과제에는 starter와 solution이 필요합니다.');
    if (officialDomains.length > 0) {
      const sourceUrls = (lesson.sources ?? []).map((source) => source.url).filter(Boolean);
      if (sourceUrls.length === 0) fail(failures, lesson, '공식 문서 출처가 없습니다.');
      if (sourceUrls.length > 0 && !sourceUrls.some((url) => isOfficialSource(url, officialDomains))) {
        fail(failures, lesson, `공식 문서 출처가 ${officialDomains.join(', ')} 중 하나가 아닙니다.`);
      }
    }
  }
  return failures;
}

function validateStackProfile(stack, lessons) {
  const failures = [];
  const profile = stackProfiles[stack];
  if (!profile) return failures;
  const combined = lessons.map(textOf).join('\n');
  for (const stage of profile.requiredStages) {
    if (!stage.pattern.test(combined)) failures.push(`${profile.label} 커리큘럼에 ${stage.name} 단계가 없습니다.`);
  }
  return failures;
}

function validateCourse(course, lessons) {
  const failures = [];
  const practices = lessons.filter((lesson) => lesson.kind === 'practice');
  const practiceIds = practices.map((lesson) => lesson.id);
  if (!course || typeof course !== 'object') return ['과정 전체의 대상 학습자와 수료 목표를 정의해야 합니다.'];

  if (!course.audience || typeof course.audience.description !== 'string' || course.audience.description.trim().length < 40) {
    failures.push('대상 학습자가 어떤 경험을 가진 사람인지 구체적으로 정의해야 합니다.');
  }
  if (!Array.isArray(course.audience?.prerequisites) || course.audience.prerequisites.length < 2) {
    failures.push('대상 학습자의 선수 지식을 최소 2개 정의해야 합니다.');
  }

  const actionWords = /(작성|수정|검증|변환|구분|설명|구현|설정|배포|운영|테스트|진단|설계)/;
  if (!Array.isArray(course.completionOutcomes) || course.completionOutcomes.length < 3
    || course.completionOutcomes.some((outcome) => typeof outcome !== 'string' || outcome.length < 20 || !actionWords.test(outcome))) {
    failures.push('수료 후 할 수 있는 일을 관찰 가능한 행동으로 최소 3개 정의해야 합니다.');
  }

  if (!Array.isArray(course.flow) || course.flow.length === 0) {
    failures.push('수료 목표까지 이어지는 학습 흐름을 정의해야 합니다.');
  } else {
    const seen = new Set();
    const coveredOutcomes = new Set();
    const outcomeCount = Array.isArray(course.completionOutcomes) ? course.completionOutcomes.length : 0;
    for (const stage of course.flow) {
      if (!stage?.id || !stage.title || typeof stage.rationale !== 'string' || stage.rationale.length < 40) {
        failures.push(`${stage?.id ?? '?'} 학습 단계에 순서의 이유를 구체적으로 적어야 합니다.`);
      }
      if (!Array.isArray(stage?.outcomeRefs) || stage.outcomeRefs.length === 0
        || stage.outcomeRefs.some((ref) => !Number.isInteger(ref) || ref < 0 || ref >= outcomeCount)) {
        failures.push(`${stage?.id ?? '?'} 학습 단계가 수료 목표와 연결되지 않았습니다.`);
      }
      for (const ref of stage?.outcomeRefs ?? []) if (Number.isInteger(ref) && ref >= 0 && ref < outcomeCount) coveredOutcomes.add(ref);
      for (const id of stage?.lessonIds ?? []) {
        if (seen.has(id)) failures.push(`${id} 실습이 학습 흐름에 중복되었습니다.`);
        seen.add(id);
        if (!practiceIds.includes(id)) failures.push(`${id}는 공개된 실습 ID가 아닙니다.`);
      }
    }
    for (const id of practiceIds) if (!seen.has(id)) failures.push(`${id} 실습이 학습 흐름에 없습니다.`);
    for (let index = 0; index < outcomeCount; index += 1) {
      if (!coveredOutcomes.has(index)) failures.push(`수료 목표 ${index + 1}이 학습 단계와 연결되지 않았습니다.`);
    }
    if (practiceIds.some((id, index) => [...seen][index] !== id)) failures.push('학습 흐름의 실습 순서가 실제 공개 순서와 다릅니다.');
  }

  const plan = course.practicePlan;
  if (!plan || !Number.isInteger(plan.minimum) || !Number.isInteger(plan.maximum)
    || plan.minimum < 1 || plan.maximum < plan.minimum || typeof plan.rationale !== 'string' || plan.rationale.length < 40) {
    failures.push('실습 수의 최소·최대 범위와 그 근거를 정의해야 합니다.');
  } else if (practices.length < plan.minimum || practices.length > plan.maximum) {
    failures.push(`현재 실습 ${practices.length}개가 평가한 범위 ${plan.minimum}~${plan.maximum}개를 벗어납니다.`);
  }
  if (!plan || !['approved', 'revise'].includes(plan.decision)) {
    failures.push('실습 수가 수료 목표에 적절한지 평가하고 approved 또는 revise로 기록해야 합니다.');
  }
  return failures;
}

function validateCurriculum(data) {
  if (!data.stack) return ['stack 값이 필요합니다.'];
  if (!Array.isArray(data.lessons) || data.lessons.length === 0) return [`${data.stack} 커리큘럼에 lesson이 없습니다.`];
  const identities = [];
  const ids = new Set();
  for (const lesson of data.lessons) {
    if (!lesson || typeof lesson.id !== 'string' || !lesson.id.trim()) identities.push('레슨 ID가 필요합니다.');
    else if (ids.has(lesson.id)) identities.push(lesson.id + ' 레슨 ID가 중복되었습니다.');
    else ids.add(lesson.id);
    if (!lesson || !['practice', 'diagnostic'].includes(lesson.kind)) identities.push((lesson?.id ?? '?') + ' 레슨 kind가 올바르지 않습니다.');
  }
  if (identities.length) return identities;
  return [...validateCourse(data.course, data.lessons), ...validateCommon(data.stack, data.lessons), ...validateStackProfile(data.stack, data.lessons)];
}

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}

try {
  const data = args.mode === 'fixture' ? loadFixture(args.path) : await loadProjectLessons();
  const failures = validateCurriculum(data);
  const skippedDiagnostics = data.lessons.filter((lesson) => lesson.kind === 'diagnostic').length;
  console.log(JSON.stringify({
    event: 'curriculum-quality-verification', stack: data.stack,
    lessons: data.lessons.length, lessonIds: data.lessons.map((lesson) => lesson.id),
    checkedLessons: data.lessons.length - skippedDiagnostics, skippedDiagnostics,
    course: data.course ? {
      practiceDecision: data.course.practicePlan?.decision,
      practiceRange: [data.course.practicePlan?.minimum, data.course.practicePlan?.maximum],
    } : undefined,
    failureCount: failures.length, status: failures.length ? 'failed' : 'passed',
  }));
  if (failures.length > 0) {
    console.error('Curriculum quality verification failed.');
    failures.forEach((failure) => console.error('- ' + failure));
    process.exitCode = 1;
  }
} catch (error) {
  console.error('Curriculum quality loading failed: ' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 2;
}
