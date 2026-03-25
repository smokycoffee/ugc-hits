type CreatorDashboardSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type CreatorDashboardPageState = {
  applied: boolean;
  error: string | null;
};

function getSearchParamValue(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return typeof value === "string" ? value.trim() : "";
}

function decodeQueryValue(value: string) {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getCreatorDashboardPageState(
  searchParams: CreatorDashboardSearchParams,
): CreatorDashboardPageState {
  return {
    applied: getSearchParamValue(searchParams.applied) === "1",
    error: decodeQueryValue(getSearchParamValue(searchParams.error)),
  };
}
