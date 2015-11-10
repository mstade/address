### Adding parameters

Path parameters can be added through the ```.param()``` method and will be interpolated into the path.

```
// individual params

address("/price/{ccy1}/{ccy2}")
  .param("ccy1", "usd")
  .param("ccy2", "gbp")
  .get()

// multpile params

address("/price/{ccy1}/{ccy2}")
  .param({ccy1 : "usd", ccy2 : "gbp"})
  .get()
```

Search parameters can be added through the ```.query()``` method and will be appended to the path.

```
address("/price/usd/gbp")
  .query("ccy1", "usd")
  .query("ccy2", "gbp")

-> /price/usd/gbp?ccy1=usd&ccy2=gbp
```
