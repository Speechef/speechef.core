# FIX9.1 — Remove Redundant source= Arg from AnalysisSessionSerializer

## Problem
`backend/analysis/serializers.py` line 17:
```python
mentor_session_id = serializers.IntegerField(source='mentor_session_id', read_only=True, allow_null=True)
```
`source='mentor_session_id'` points to the same name as the field — it is
a no-op and redundant. DRF infers the `source` from the field name by default,
so the explicit `source` annotation adds noise and risk of silent misfire if
the field is ever renamed.

## Solution
Remove the `source` argument.

## Files Changed
| File | Change |
|------|--------|
| `backend/analysis/serializers.py` | Remove `source='mentor_session_id'` from `IntegerField` |

## No Frontend Changes, No Migration
