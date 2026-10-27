import { useEffect, useState } from 'react'
import { Form, InputGroup } from 'react-bootstrap'

export default function DebouncedLaptopSearch({ initialValue, onCommit }) {
  const [keyword, setKeyword] = useState(initialValue)

  useEffect(() => {
    const timeout = setTimeout(() => {
      onCommit(keyword.trim())
    }, 500)

    return () => clearTimeout(timeout)
  }, [keyword, onCommit])

  return (
    <InputGroup>
      <InputGroup.Text aria-hidden="true">🔍</InputGroup.Text>
      <Form.Control
        type="search"
        placeholder="Tìm theo tên, CPU, card đồ họa..."
        aria-label="Tìm trong danh sách"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
    </InputGroup>
  )
}
