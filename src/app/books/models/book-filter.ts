export interface BookFilter {
  specialQuery: string;
  title: string;
  author: string;
  isbn: string;
  subject: string;
  publisher: string;
  place: string;
  person: string;
  sort: string;
  limit: number;
  page: number;
}
