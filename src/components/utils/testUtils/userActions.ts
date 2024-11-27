import { expect } from 'vitest'
import { waitFor, fireEvent, screen } from '@testing-library/react'

export const canSee = async (text: string) =>
  await waitFor(() => expect(screen.getByText(text)).toBeInTheDocument(), { timeout: 5e3 })

export const clickByTestId = async (testId: string) => {
  await waitFor(() => {
    const element = screen.getByTestId(testId)
    element.click()
  })
}

export const click = async (text: string) => {
  await waitFor(() => {
    const element = screen.getByText(text)
    element.click()
  })
}

export const typeByTestId = async (testId: string, value: string) => {
  const element = await waitFor(() => screen.getByTestId(testId))
  fireEvent.change(element, { target: { value } })
}

export const pressKey = (key: string) => fireEvent.keyDown(document, { key })
