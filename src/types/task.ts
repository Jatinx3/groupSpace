export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  assignees?: string[] | null;
  status: string;
  due_date: string | null;
  team_id: string;
  created_at: string;
}