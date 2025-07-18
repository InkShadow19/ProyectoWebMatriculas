export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual
  size: number;
  first: boolean;
  last: boolean;
}
