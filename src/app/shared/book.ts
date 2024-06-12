export interface Book {
  cover_i: number;
  title: string;
  author_name: string[];
  isbn: string[];
  ratings_average: number;
  ratings_count: number;
  edition_key: string[];

  has_fulltext: boolean;
  first_sentence: string[];
  edition_count: number;
  first_publish_year: number;
  key: string;
  ia: string[];
  author_key: string[];
  public_scan_b: boolean;
}
