import React, { useState, useEffect } from 'react'

type UseIdTokenReturn = {
  idToken: string
  setIdToken: React.Dispatch<React.SetStateAction<string>>
}

/**
 * localStorageに保存されたidTokenを取得するフック
 *
 * @return {UseIdTokenReturn}
 */
export const useIdToken = (): UseIdTokenReturn => {
  const [idToken, setIdToken] = useState<string>('')
  useEffect(() => {
    // cognitoがlocalStorageにidTokenを保存するので、
    // keyにidTokenの文字が含まれる要素を取得する
    const localStorage = window.localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) {
        return
      }
      const value = localStorage.getItem(key)
      if (value && key.includes('idToken')) {
        setIdToken(value)
        break
      }
    }
  }, [])

  return { idToken: idToken, setIdToken: setIdToken }
}
