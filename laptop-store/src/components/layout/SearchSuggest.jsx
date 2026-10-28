import { useEffect, useRef, useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import laptopListApi from '../../api/laptopListApi'
import { formatPrice } from '../../utils/format'

export default function SearchSuggest({ onNavigate }) {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const requestRef = useRef(null)
  const [keyword, setKeyword] = useState('')
  const [searchState, setSearchState] = useState({
    query: '',
    suggestions: [],
    loading: false,
    error: '',
  })
  const [isOpen, setIsOpen] = useState(false)
  const query = keyword.trim()
  const currentSearch =
    searchState.query === query
      ? searchState
      : { suggestions: [], loading: false, error: '' }
  const showSuggestions = isOpen && Boolean(keyword.trim())

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (!query) {
      return undefined
    }

    const controller = new AbortController()
    requestRef.current = controller

    async function loadSuggestions() {
      try {
        const result = await laptopListApi.getAll(
          { q: query, _limit: '5' },
          controller.signal,
        )

        if (!controller.signal.aborted) {
          setSearchState({
            query,
            suggestions: result.items,
            loading: false,
            error: '',
          })
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setSearchState({
            query,
            suggestions: [],
            loading: false,
            error: requestError?.message || 'Không thể tải gợi ý tìm kiếm.',
          })
        }
      }
    }

    const timeoutId = setTimeout(loadSuggestions, 400)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
      if (requestRef.current === controller) {
        requestRef.current = null
      }
    }
  }, [query])

  function handleChange(event) {
    const nextKeyword = event.target.value
    const nextQuery = nextKeyword.trim()
    if (nextQuery !== query) {
      requestRef.current?.abort()
      requestRef.current = null
      setSearchState({
        query: nextQuery,
        suggestions: [],
        loading: Boolean(nextQuery),
        error: '',
      })
    }
    setKeyword(nextKeyword)
    setIsOpen(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const query = keyword.trim()

    if (!query) {
      return
    }

    requestRef.current?.abort()
    setIsOpen(false)
    setSearchState({
      query: '',
      suggestions: [],
      loading: false,
      error: '',
    })
    navigate(`/laptops?q=${encodeURIComponent(query)}`)
    setKeyword('')
    onNavigate?.()
  }

  function handleSelect(laptop) {
    requestRef.current?.abort()
    setIsOpen(false)
    setSearchState({
      query: '',
      suggestions: [],
      loading: false,
      error: '',
    })
    setKeyword('')
    navigate(`/laptops/${encodeURIComponent(laptop.id)}`)
    onNavigate?.()
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="position-relative" ref={containerRef}>
      <Form className="my-2 my-lg-0" onSubmit={handleSubmit} role="search">
        <InputGroup>
          <Form.Control
            type="search"
            placeholder="Tìm laptop..."
            aria-label="Tìm laptop"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="laptop-search-suggestions"
            role="combobox"
            value={keyword}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
          <Button type="submit" variant="warning">
            Tìm
          </Button>
        </InputGroup>
      </Form>

      {showSuggestions && (
        <div
          id="laptop-search-suggestions"
          className="list-group position-absolute w-100 shadow search-suggest-list"
          role="listbox"
          aria-label="Gợi ý laptop"
        >
          {currentSearch.loading && (
            <div className="list-group-item text-secondary" role="status">
              Đang tìm laptop...
            </div>
          )}
          {currentSearch.error && (
            <div className="list-group-item text-danger" role="alert">
              {currentSearch.error}
            </div>
          )}
          {!currentSearch.loading &&
            !currentSearch.error &&
            currentSearch.suggestions.length === 0 && (
            <div className="list-group-item text-secondary">
              Không tìm thấy laptop phù hợp.
            </div>
          )}
          {currentSearch.suggestions.map((laptop) => (
            <button
              key={laptop.id}
              type="button"
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-3"
              role="option"
              aria-selected="false"
              onClick={() => handleSelect(laptop)}
            >
              <span className="text-start text-truncate">{laptop.name}</span>
              <span className="text-nowrap fw-semibold">
                {formatPrice(laptop.salePrice ?? laptop.price)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
