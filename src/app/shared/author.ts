export interface Author {
  key: string;
  name: string;
  personal_name?: string;
  alternate_names?: string[];
  birth_date?: string;
  photos?: number[];
  bio?: {
    type: string;
    value: string;
  };
  links?: {
    title: string;
    url: string;
    type: {
      key: string;
    };
  }[];

  source_records?: string[];
  type: {
    key: string;
  };
  latest_revision: number;
  revision: number;
  created: {
    type: string;
    value: string;
  };
  last_modified: {
    type: string;
    value: string;
  };
}
