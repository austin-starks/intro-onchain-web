export function parseSession(
  result?: [number, number, bigint, bigint] | readonly [number, number, bigint, bigint]
) {
  if (!result) return undefined;
  return {
    start: result[0],
    end: result[1],
    totalAttended: parseInt(result[2].toString()),
    maxAttendees: parseInt(result[3].toString()),
  };
}
