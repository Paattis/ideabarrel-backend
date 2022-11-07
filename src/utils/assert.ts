/**
 * Assert that specified expressin is true. Otherwise
 * throw error specified later in call chain.
 *
 * @param expression Expression to test against
 */
export function asserThat(expression: boolean) {
  return {
    /**
     * Throws error with specified message and JSON.stringified debug info.
     *
     * @param message Error message.
     * @param debug Any objects for debug reasons.
     */
    elseFail: (message: string, ...debug: any[]) => {
      if (!expression) {
        const assertionError = message
          .concat(' ')
          .concat(debug?.map((it) => JSON.stringify(it)).join(' ') + '\n');
        throw new Error(assertionError);
      }
    },
  };
}
