const Pagination = (limit, page, response) => {
  const totalPages = Math.ceil(response.count / limit);
  const results = {
    data: response.rows,
    currentPage: parseInt(page),
    totalPages: totalPages,
    totalItems: response.count,
  }
  return results
}
module.exports = Pagination