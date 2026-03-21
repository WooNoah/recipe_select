# Ingredient Group Reference

This document is the source of truth for menu metadata groups used by the random draw logic.

Use it when adding new dishes to `recipe_menu.md` so group names stay consistent over time.

## Purpose

- Keep `protein` values stable across `经典肉类` and `汤品`
- Reserve `veg` values for future multi-vegetable pairing rules
- 避免把同一种分组写成多个名字，例如把“甲壳海鲜”又写成“虾类”或“海鲜”
- Make future weight tuning in `src/menuConfig.mjs` predictable

## `protein` groups

Used today by:

- `经典肉类`
- `汤品`

Current supported values:

| 分组值 | 含义 | 典型菜例 |
| --- | --- | --- |
| `猪肉` | 猪肉主导 | 红烧肉、排骨汤、红烧猪蹄、腌笃鲜 |
| `牛肉` | 牛肉主导 | 番茄牛腩、酸汤肥牛、罗宋汤 |
| `鸡肉` | 鸡肉主导 | 油焖鸡、可乐鸡翅、鸡翅鸡爪 |
| `羊肉` | 羊肉主导 | 香煎羊排、羊排汤 |
| `鱼类` | 鱼类主导 | 番茄鱼、鱼汤 |
| `甲壳海鲜` | 虾、蟹、贝类等甲壳或海鲜主导 | 虾仁豆腐汤、虾蟹煲、蒜蓉粉丝虾 |
| `蛋类` | 鸡蛋为主，不归到肉类 | 荷包蛋汤、番茄蛋汤 |
| `混合` | 明显混合主料，无法合理归入单一组 | 麻辣香锅、猪肚鸡汤 |

## `protein` assignment rules

Use these rules in order:

1. If one meat or seafood is clearly the main ingredient, use that group.
2. If the dish has shrimp or crab as the obvious star, use `甲壳海鲜`.
3. If the dish is centered on fish, use `鱼类`.
4. If egg is the main protein and there is no stronger meat lead, use `蛋类`.
5. If two proteins are equally central and splitting them would be misleading, use `混合`.

## `protein` naming rules

- Reuse existing group names whenever possible.
- 不要再发明新的同义值，比如把 `甲壳海鲜` 写成 `海鲜`、`虾类`、`甲壳类`。
- If a truly new protein group is needed, update both:
  - `src/menuConfig.mjs`
  - this document

## `veg` groups

Reserved for future use by:

- `素菜类`

These groups do not change current draw behavior yet, but they should stay consistent now so future weighting is easy to enable.

Current supported values:

| 分组值 | 含义 | 典型菜例 |
| --- | --- | --- |
| `叶菜类` | 叶菜类 | 清炒菠菜、蒜蓉生菜、蚝油菜心 |
| `瓜果类` | 瓜果类蔬菜 | 黄瓜、西葫芦、冬瓜、丝瓜 |
| `根茎类` | 根茎类 | 土豆、萝卜、莲藕、山药 |
| `豆制品` | 豆腐和豆制品主导 | 麻婆豆腐、家常豆腐、香干炒芹菜 |
| `菌菇类` | 菌菇类主导 | 香菇青菜、杏鲍菇、金针菇豆腐煲 |
| `蛋类` | 蛋类素菜 | 番茄炒蛋、黄瓜炒蛋 |
| `混合` | 组合型素菜，无法合理归入单一组 | 地三鲜、素什锦 |

## `veg` assignment rules

1. Choose the dominant vegetable family, not every ingredient in the dish.
2. If tofu or bean products are the main body of the dish, prefer `豆制品`.
3. If mushrooms are the main identity of the dish, prefer `菌菇类`.
4. If eggs are the main protein in an otherwise vegetarian dish, use `蛋类`.
5. If the dish is truly mixed and no single family dominates, use `混合`.

## Suggested workflow when adding a dish

1. Add the dish under the correct section in `recipe_menu.md`
2. Assign an existing `protein` or `veg` group whenever possible
3. If you need a new group:
   - add the new group to `src/menuConfig.mjs`
   - add the new group to this document
   - review whether any weights should be adjusted

## Examples

```md
1. 红烧肉 | protein=猪肉
2. 虾仁豆腐汤 | protein=甲壳海鲜
3. 猪肚鸡汤 | protein=混合
4. 清炒菠菜 | veg=叶菜类
5. 家常豆腐 | veg=豆制品
```
