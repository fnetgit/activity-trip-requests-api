export interface Holiday {
  date: string
  name: string
  type: string
}

export interface HolidaysGateway {
  findByYear(year: number): Promise<Holiday[]>
}
