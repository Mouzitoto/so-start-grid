export interface Person {
  id: string;
  bib: number;
  name: string;
  surname: string;
  birth_date: string | null;
  card_number: number;
  comment: string;
  group_id: string;
  organization_id: string | null;
  qual: number;
  sex: number;
  start_group: number;
  start_time: number; // В миллисекундах
  is_out_of_competition: boolean;
  is_paid: boolean;
  is_personal: boolean;
  is_rented_card: boolean;
  year: number;
  group?: Group; // Добавляется после парсинга
  organization?: Organization; // Добавляется после парсинга
}

export interface Group {
  id: string;
  name: string;
  long_name: string;
  start_corridor: number;
  start_interval: number;
  count_person: number;
}

export interface Organization {
  id: string;
  name: string;
  contact: string;
  code: string;
  country: string;
  region: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface RaceData {
  chief_referee: string;
  description: string;
  end_datetime: string;
  location: string;
  race_type: number;
  relay_leg_count: number;
  secretary: string;
  start_datetime: string;
  title: string;
  url: string;
}

export interface Race {
  id: string;
  object: string;
  courses: Course[];
  data: RaceData;
  groups: Group[];
  organizations: Organization[];
  persons: Person[];
  results: any[];
  settings: any;
}

