// PRD · 팀업무 주차별 현황 공유 — 가상 데이터 (전부 AI 생성, 실제 사업/인명 아님)
// 기능 기준: 1) 차주 계획 2) 금주 실적+진척율+지연/병목+협조 4) 개인일정(근태/교육)
// 필드: id, week, assignee, business(A~D사업/공통), task, detail, type(금주실적/차주계획/개인일정),
//       status(완료/정상/지연/병목), progress(0~100, 개인일정은 null), coop(없음/타부서/외부), due(종료예정일 YYYY-MM-DD), nextWeek(차주 계속)
// 규칙 케이스 3건: id 7(지연→차주이월), id 18(병목+타부서협조), id 26(다주차인데 진척율 미기재→0% 인식)

const DATA = [
  { id: 1, week: "2026-10-1주차", assignee: "팀장", business: "A사업", task: "주간 점검표 초안 작성", detail: "A사업 월간 점검 항목 초안 정리", type: "금주실적", status: "완료", progress: 100, coop: "없음", due: "2026-10-02", nextWeek: false },
  { id: 2, week: "2026-10-1주차", assignee: "팀장", business: "A사업", task: "점검 결과 정리 및 공유", detail: "점검 결과 취합 후 팀 공유자료 작성", type: "차주계획", status: "정상", progress: 20, coop: "없음", due: "", nextWeek: true },
  { id: 3, week: "2026-10-1주차", assignee: "팀장", business: "B사업", task: "모니터링 지표 취합", detail: "B사업 주간 지표 수집 및 표 정리", type: "금주실적", status: "정상", progress: 60, coop: "타부서", due: "", nextWeek: true },
  { id: 4, week: "2026-10-1주차", assignee: "팀장", business: "공통", task: "팀 주간회의 자료 준비", detail: "금요일 공유용 주간업무 취합본 작성", type: "금주실적", status: "완료", progress: 100, coop: "없음", due: "2026-10-02", nextWeek: false },
  { id: 5, week: "2026-10-1주차", assignee: "팀장", business: "공통", task: "연차 사용", detail: "개인일정·연차(금요일 오후)", type: "개인일정", status: "정상", progress: null, coop: "없음", due: "2026-10-02", nextWeek: false },
  { id: 6, week: "2026-10-1주차", assignee: "팀장", business: "C사업", task: "외부 협의 일정 조율", detail: "C사업 관련 외부 협의 일정 확정", type: "금주실적", status: "정상", progress: 40, coop: "외부", due: "", nextWeek: true },
  // [규칙1] 지연 업무 → 캐치업 없이 차주 업무항목으로 이월 (PRD 4항)
  { id: 7, week: "2026-10-1주차", assignee: "팀장", business: "C사업", task: "협의 결과 반영 보고서", detail: "외부 협의 지연으로 보고서 마감 미달, 차주 항목으로 이월", type: "금주실적", status: "지연", progress: 30, coop: "외부", due: "", nextWeek: true },
  { id: 8, week: "2026-10-2주차", assignee: "팀장", business: "C사업", task: "협의 결과 반영 보고서 (이월)", detail: "차주에 보고서 마무리 및 팀장 확인", type: "차주계획", status: "정상", progress: 30, coop: "외부", due: "", nextWeek: true },
  { id: 9, week: "2026-10-1주차", assignee: "팀원1", business: "B사업", task: "개선과제 목록 정리", detail: "B사업 개선과제 후보 5건 목록화", type: "금주실적", status: "완료", progress: 100, coop: "없음", due: "2026-10-02", nextWeek: false },
  { id: 10, week: "2026-10-1주차", assignee: "팀원1", business: "B사업", task: "개선과제 효과 분석", detail: "후보 과제별 예상 효과표 작성", type: "차주계획", status: "정상", progress: 10, coop: "타부서", due: "", nextWeek: true },
  { id: 11, week: "2026-10-1주차", assignee: "팀원1", business: "D사업", task: "진척율 집계표 업데이트", detail: "D사업 다주차 업무 진척율 갱신", type: "금주실적", status: "정상", progress: 70, coop: "없음", due: "", nextWeek: true },
  { id: 12, week: "2026-10-1주차", assignee: "팀원1", business: "A사업", task: "타부서 협조 요청 정리", detail: "A사업 자료 요청 공문 초안 작성", type: "금주실적", status: "정상", progress: 80, coop: "타부서", due: "2026-10-02", nextWeek: false },
  { id: 13, week: "2026-10-2주차", assignee: "팀원1", business: "A사업", task: "협조 요청 후속 확인", detail: "타부서 회신 확인 및 일정 반영", type: "차주계획", status: "정상", progress: 0, coop: "타부서", due: "", nextWeek: true },
  { id: 14, week: "2026-10-2주차", assignee: "팀원1", business: "공통", task: "사내 교육 참석", detail: "개인일정·직무 교육(목요일 오전)", type: "개인일정", status: "정상", progress: null, coop: "없음", due: "2026-10-08", nextWeek: false },
  { id: 15, week: "2026-10-2주차", assignee: "팀원1", business: "D사업", task: "D사업 중간 점검", detail: "D사업 중간 점검표 작성 및 검토 요청", type: "금주실적", status: "완료", progress: 100, coop: "없음", due: "2026-10-09", nextWeek: false },
  { id: 16, week: "2026-10-2주차", assignee: "팀원1", business: "B사업", task: "개선과제 팀원 의견 수렴", detail: "팀원별 담당 과제 의견 취합", type: "차주계획", status: "정상", progress: 0, coop: "없음", due: "", nextWeek: true },
  { id: 17, week: "2026-10-1주차", assignee: "팀원2", business: "D사업", task: "모니터링 체크리스트 정비", detail: "D사업 주간 체크리스트 항목 보완", type: "금주실적", status: "완료", progress: 100, coop: "없음", due: "2026-10-02", nextWeek: false },
  // [규칙2] 병목 + 타부서 협조 필요 (PRD 3-2항: 병목·협조 가시화)
  { id: 18, week: "2026-10-1주차", assignee: "팀원2", business: "A사업", task: "A사업 자료 취합", detail: "타부서 회신 대기 중 병목 발생, 협조 필요", type: "금주실적", status: "병목", progress: 45, coop: "타부서", due: "", nextWeek: true },
  { id: 19, week: "2026-10-2주차", assignee: "팀원2", business: "A사업", task: "A사업 자료 취합 (계속)", detail: "미회신분 재요청 및 취합 마무리", type: "차주계획", status: "정상", progress: 45, coop: "타부서", due: "", nextWeek: true },
  { id: 20, week: "2026-10-1주차", assignee: "팀원2", business: "공통", task: "인수인계표 작성", detail: "부재 대비 담당 업무 인수인계표 정리", type: "금주실적", status: "완료", progress: 100, coop: "없음", due: "2026-10-02", nextWeek: false },
  { id: 21, week: "2026-10-2주차", assignee: "팀원2", business: "C사업", task: "C사업 일정 변동사항 반영", detail: "외부 일정 변경분 주간계획에 반영", type: "금주실적", status: "지연", progress: 50, coop: "외부", due: "", nextWeek: true },
  { id: 22, week: "2026-10-2주차", assignee: "팀원2", business: "공통", task: "반차 사용", detail: "개인일정·반차(수요일 오후, 병원)", type: "개인일정", status: "정상", progress: null, coop: "없음", due: "2026-10-07", nextWeek: false },
  { id: 23, week: "2026-10-2주차", assignee: "팀원2", business: "B사업", task: "B사업 개선안 초안 작성", detail: "개선과제 초안 작성 및 내부 검토", type: "차주계획", status: "정상", progress: 15, coop: "없음", due: "", nextWeek: true },
  { id: 24, week: "2026-10-1주차", assignee: "팀원3", business: "C사업", task: "주간 실적 취합 보조", detail: "C사업 금주 실적분 취합 지원", type: "금주실적", status: "완료", progress: 100, coop: "없음", due: "2026-10-02", nextWeek: false },
  { id: 25, week: "2026-10-1주차", assignee: "팀원3", business: "D사업", task: "D사업 공동과제 회의 준비", detail: "팀원 공동과제 회의 안건 정리", type: "금주실적", status: "정상", progress: 65, coop: "없음", due: "", nextWeek: true },
  // [규칙3] 여러 주차 진행 업무인데 진척율 미기재 → 0% 인식 (PRD 1항: 진척율 누락 문제)
  { id: 26, week: "2026-10-2주차", assignee: "팀원3", business: "D사업", task: "D사업 공동과제 후속 작업", detail: "2주차 연속 진행 중, 진척율 미입력 → 0% 인식", type: "금주실적", status: "정상", progress: 0, coop: "없음", due: "", nextWeek: true },
  { id: 27, week: "2026-10-2주차", assignee: "팀원3", business: "B사업", task: "B사업 차주 점검 계획 수립", detail: "차주 점검 일정 및 담당 분담표 작성", type: "차주계획", status: "정상", progress: 0, coop: "없음", due: "", nextWeek: true },
  { id: 28, week: "2026-10-2주차", assignee: "팀원3", business: "A사업", task: "A사업 마감 자료 검토", detail: "마감 자료 오탈자 및 수치 검산", type: "금주실적", status: "완료", progress: 100, coop: "없음", due: "2026-10-09", nextWeek: false },
  { id: 29, week: "2026-10-2주차", assignee: "팀원3", business: "공통", task: "출장 (자료 조사)", detail: "개인일정·출장(화요일, 자료 조사)", type: "개인일정", status: "정상", progress: null, coop: "없음", due: "2026-10-06", nextWeek: false },
  { id: 30, week: "2026-10-2주차", assignee: "팀원3", business: "C사업", task: "C사업 차주 협의 안건 정리", detail: "외부 협의용 안건 초안 작성", type: "차주계획", status: "정상", progress: 10, coop: "외부", due: "", nextWeek: true },
];
