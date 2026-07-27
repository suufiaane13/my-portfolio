import { describe, expect, it } from 'vitest'
import { classifyByCpl, evalToSideCp, evalToWhitePov } from '@/lib/chess/moveQuality'

describe('moveQuality classification', () => {
  it('treats small CPL as best, not blunder', () => {
    expect(classifyByCpl(0, true)).toBe('best')
    expect(classifyByCpl(15, false)).toBe('best')
    expect(classifyByCpl(35, false)).toBe('excellent')
    expect(classifyByCpl(70, false)).toBe('good')
    expect(classifyByCpl(120, false)).toBe('inaccuracy')
    expect(classifyByCpl(220, false)).toBe('mistake')
    expect(classifyByCpl(400, false)).toBe('blunder')
  })

  it('converts mate scores to comparable cp', () => {
    expect(evalToSideCp({ type: 'mate', value: 2 })).toBeGreaterThan(9000)
    expect(evalToSideCp({ type: 'mate', value: -1 })).toBeLessThan(-9000)
    expect(evalToWhitePov({ type: 'cp', value: 50 }, 'b')).toBe(-50)
  })
})
