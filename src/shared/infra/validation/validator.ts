export interface Validator<TOutput> {
  validate(input: unknown): TOutput
}
