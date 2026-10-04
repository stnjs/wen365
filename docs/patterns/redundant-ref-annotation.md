---
slug: redundant-ref-annotation
target: lint # lint | prose — decides the promotion threshold
status: watching # watching | promoted | rejected
promoted-to:
rejected-reason:
---

A `ref`, `shallowRef` or `computed` is typed twice: once on the variable and once on the call. Type the call only.

**Bad:** `const foo: Ref<string> = ref<string>("hello world")`

**Good:** `const foo = ref<string>("hello world")`

**Lint candidate:** `no-restricted-syntax` with selector `VariableDeclarator[id.typeAnnotation] > CallExpression[callee.name=/^(ref|shallowRef|computed)$/][typeArguments]`.
