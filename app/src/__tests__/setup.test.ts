describe('Project Setup', () => {
  it('should run tests correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have TypeScript strict mode working', () => {
    const value: string = 'hello';
    expect(typeof value).toBe('string');
  });
});
