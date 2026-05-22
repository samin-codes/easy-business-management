# workflow
- Always make a detailed plan and get approval before implementing any changes. Confidence: 0.85
- Use "onEventName" for callback props and "handleEvent" for handler functions in parent components. Confidence: 0.75

# react
- Avoid useMemo and unnecessary memoization unless there is a proven performance issue. Confidence: 0.70
- Colocate computed variables and state with the component that owns them rather than lifting everything to the parent. Confidence: 0.70
- Co-locate helper functions (e.g., makeSortLink, makeSortDirection) with the component that uses them. Confidence: 0.75
- Keep components co-located with the page that uses them instead of extracting to shared components when only used in one place. Confidence: 0.75

# ui
- Use shadcn Combobox instead of Select for searchable dropdown fields. Confidence: 0.75
- Use the existing shared table component (e.g., PurchaseItemsTable) for purchase items display instead of writing inline table markup, to maintain consistency across pages. Confidence: 0.70

# inertia
- Use `routeHelper(args).url` (calling the route helper first, then accessing .url) instead of `routeHelper.url(args)` for Wayfinder URL strings in page code. Confidence: 0.75
- Prefer declarative Inertia `<Form method="get">` and `<Link>` components over imperative `router.visit` with local React state/effects for search, filtering, and pagination. Confidence: 0.70
- Import route helpers directly in the component that uses them instead of receiving them as props from a parent. Confidence: 0.65

# laravel
- Name FormRequest data-extraction methods with a domain-specific name (e.g., `purchaseData()`) instead of generic names like `values()` or `data()`. Confidence: 0.70
- Prefer dedicated controllers (e.g., `PurchasePaymentController`) over adding sub-resource actions to existing controllers. Confidence: 0.65

# code-style
- Use date-fns (or existing library utilities) instead of creating ad-hoc formatting utility functions like inline formatDate helpers. Confidence: 0.75
