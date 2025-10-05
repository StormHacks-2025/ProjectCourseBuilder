export function parsePaging({ page = 1, limit = 10 }) {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (currentPage - 1) * pageSize;
  return { page: currentPage, limit: pageSize, skip };
}
