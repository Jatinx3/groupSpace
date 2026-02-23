export interface Team {
  id: string;
  name: string;
  course_id: string;
  courses?: {
    id: string;
    name: string;
  }[];
}