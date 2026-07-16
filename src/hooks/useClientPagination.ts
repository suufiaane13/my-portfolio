import { useEffect, useMemo, useState } from 'react'

export const ADMIN_PAGE_SIZE = 15

export function useClientPagination<T>(items: T[], pageSize = ADMIN_PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize) || 1)

  useEffect(() => {
    setPage(1)
  }, [items])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const safePage = Math.min(Math.max(1, page), pageCount)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, pageSize, safePage])

  return {
    page: safePage,
    setPage,
    pageCount,
    pageItems,
    total: items.length,
    pageSize,
  }
}
