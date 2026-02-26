# Spec and build

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:
- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

If you are blocked and need user clarification, mark the current step with `[!]` in plan.md before stopping.

---

## Workflow Steps

### [x] Step: Technical Specification
<!-- chat-id: dd785c4f-8452-4609-aac3-5255c1a245bb -->

Assess the task's difficulty, as underestimating it leads to poor outcomes.
- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:
- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `{@artifacts_path}/spec.md`:
- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Important: unit tests must be part of each implementation task, not separate tasks. Each task should implement the code and its tests together, if relevant.

Save to `{@artifacts_path}/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

---

### [x] Step: Build professor sidebar and client layout
<!-- chat-id: 65073c32-d0ef-4bf2-8cc3-7b5ec76608d4 -->

Create the interactive layout shell matching the student dashboard pattern.
- Create `src/components/professor/ProfessorSidebar.tsx` — collapsible sidebar with Overview and Thesis Collab nav items, indigo active state, GroupSpace logo
- Create `src/components/professor/ProfessorLayoutClient.tsx` — client component with: mobile overlay, sidebar toggle (hamburger), avatar dropdown (profile/logout), and content area with `bg-slate-100`
- Modify `src/app/professor/layout.tsx` — keep server-side auth guard, pass `firstName` to `ProfessorLayoutClient`, remove old header/tab JSX
- Remove `src/app/professor/professor-tabs.tsx` (navigation now in sidebar)
- Run `npm run build` and verify no errors

### [x] Step: Redesign professor overview page
<!-- chat-id: 47748706-6fce-4bb6-9f3e-bb492e713094 -->

Improve `src/app/professor/page.tsx` with richer UI.
- Add 2 minimal count queries: courses taught (`courses WHERE professor_id = user.id`) and thesis supervisees (`thesis_projects WHERE supervisor_id = user.id`)
- Reuse `Greeting` component for welcome header
- Add stats row using `StatsCard` (or inline equivalent): Courses, Thesis Supervisees
- Replace static info cards with styled quick-action cards linking to `/professor/thesis` and courses sections
- Run `npm run build` and verify no errors
- Write `{@artifacts_path}/report.md`
