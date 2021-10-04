export interface JwtToken {
  entity_type: string;
  sub: string;
  tracking_id: string;
  [otherProps: string]: any;
}
