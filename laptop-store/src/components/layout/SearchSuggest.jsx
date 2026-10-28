import { useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

// Temporary #19-compatible search field; #19 replaces this implementation.
export default function SearchSuggest({ onNavigate }) {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const query = keyword.trim()

    if (!query) {
      return
    }

    navigate(`/laptops?q=${encodeURIComponent(query)}`)
    setKeyword('')
    onNavigate?.()
  }

  return (
    <Form className="my-2 my-lg-0" onSubmit={handleSubmit} role="search">
      <InputGroup>
        <Form.Control
          type="search"
          placeholder="Tìm laptop..."
          aria-label="Tìm laptop"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Button type="submit" variant="warning">
          Tìm
        </Button>
      </InputGroup>
    </Form>
  )
}
