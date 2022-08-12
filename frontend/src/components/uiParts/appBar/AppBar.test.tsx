import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import AppBar from './AppBar'

describe('AppBar componentのテスト', () => {
  test('AppBar componentのテスト', async () => {
    const { asFragment } = render(
      <BrowserRouter>
        <AppBar />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()

    // 文字表示
    screen.getByText(/phoquash/i)
    // メニューボタンを押せるかテスト
    const button = screen.getByRole('button')
    await userEvent.click(button)
  })
})
