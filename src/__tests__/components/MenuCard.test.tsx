import { render, screen, fireEvent } from '@testing-library/react'
import { MenuCard } from '../../app/components/guest/MenuCard'
import type { MenuItem } from '../../app/types'

const baseItem: MenuItem = {
  id: 'm1',
  name: 'Nasi Goreng',
  category: 'Makanan',
  price: 25000,
  image: 'menu/nasi_goreng_abc123',
  available: true,
  tag: 'Best Seller',
}

describe('MenuCard', () => {
  it('renders name, price (rp), and tag', () => {
    render(<MenuCard item={baseItem} onSelect={jest.fn()} />)
    expect(screen.getByText('Nasi Goreng')).toBeInTheDocument()
    expect(screen.getByText('Rp 25.000')).toBeInTheDocument()
    expect(screen.getByText('Best Seller')).toBeInTheDocument()
  })

  it('shows cart qty badge when inCartQty > 0', () => {
    render(<MenuCard item={baseItem} inCartQty={3} onSelect={jest.fn()} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('calls onSelect when clicked and available', () => {
    const onSelect = jest.fn()
    render(<MenuCard item={baseItem} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Nasi Goreng'))
    expect(onSelect).toHaveBeenCalledWith(baseItem)
  })

  it('disabled and not clickable when unavailable', () => {
    const onSelect = jest.fn()
    const item = { ...baseItem, available: false }
    render(<MenuCard item={item} onSelect={onSelect} />)
    const btn = screen.getByText('Nasi Goreng').closest('button') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    fireEvent.click(btn)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
