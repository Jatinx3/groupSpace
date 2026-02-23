export interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  team_id: string;
  created_at: string;
}