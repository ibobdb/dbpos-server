const day_left = (date) => {
  const target = new Date(date);
  const current = new Date();
  const time_diff = target.getTime() - current.getTime();
  return Math.ceil(time_diff / (1000 * 60 * 60 * 24));
}
module.exports = day_left