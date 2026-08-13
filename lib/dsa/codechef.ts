export interface CodeChefResult {
  rating: number | null
  stars: string | null
  totalSolved: number
  globalRank: number | null
}

// CodeChef stars are derived deterministically from the rating band.
// Thresholds per https://www.codechef.com/ratings
function starsForRating(rating: number | null): string | null {
  if (rating == null) return null
  let n: number
  if (rating < 1400) n = 1
  else if (rating < 1600) n = 2
  else if (rating < 1800) n = 3
  else if (rating < 2000) n = 4
  else if (rating < 2200) n = 5
  else if (rating < 2500) n = 6
  else n = 7
  return `${n}★`
}

export async function fetchCodeChef(username: string): Promise<CodeChefResult> {
  // CodeChef public API (unofficial but stable)
  const res = await fetch(`https://www.codechef.com/users/${username}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; lockedIN/1.0)',
      Accept: 'text/html',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) throw new Error(`CodeChef fetch error: ${res.status}`)

  const html = await res.text()

  // Current rating — lives in the `rating-number` element, e.g.
  // <div class="rating-number">3355</div>. This is the current rating, not the highest.
  const ratingMatch = html.match(/class="rating-number"[^>]*>\s*(\d{3,4})/)
  const rating = ratingMatch ? parseInt(ratingMatch[1]) : null

  // Stars — derived from the rating band rather than scraping ★ glyphs.
  const stars = starsForRating(rating)

  // Total problems solved — page shows the plain label "Total Problems Solved: NNN",
  // sometimes with a wrapping tag around the number.
  const solvedMatch =
    html.match(/Total Problems Solved:\s*<\/?[^>]*>?\s*(\d+)/i) ??
    html.match(/Total Problems Solved:\s*(\d+)/i)
  const totalSolved = solvedMatch ? parseInt(solvedMatch[1]) : 0

  // Global rank — the user's overall rank in the `rating-ranks` block, linked to
  // /ratings/all. Active users render `<strong> 1234 </strong>`; inactive users show
  // `<strong> Inactive </strong>` (no digits) → null.
  const rankMatch = html.match(/<a[^>]*ratings\/all[^>]*>\s*<strong>\s*([\d,]+)\s*<\/strong>/)
  const globalRank = rankMatch ? parseInt(rankMatch[1].replace(/,/g, '')) : null

  return { rating, stars, totalSolved, globalRank }
}
