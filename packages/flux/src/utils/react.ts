import type { Signal } from '@madenowhere/phaze'

// Phaze migration: refs in flux can be a callback, an object with
// `current`, or a Signal<T | undefined> (auto-wired via signal.set on
// mount). mergeRefs accepts any of these forms.
type Ref<T> = ((value: T | null) => void) | { current: T | null } | Signal<T | undefined>
type RefCallback<T> = (value: T | null) => void

/*
 * https://github.com/gregberge/react-merge-refs
 * MIT License
 * Copyright (c) 2020 Greg Bergé
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export function mergeRefs<T>(refs: Array<Ref<T> | null | undefined>): RefCallback<T> {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') (ref as (v: T | null) => void)(value)
      else if (ref != null) {
        ;(ref as { current: T | null }).current = value
      }
    })
  }
}
