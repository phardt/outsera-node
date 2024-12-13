export interface WinnerDto {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface WinnerResponseDto {
  min: WinnerDto[];
  max: WinnerDto[];
}
