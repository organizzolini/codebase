# MeanderawDb Entity Relationship Diagram

<!-- postgresql-erd:start -->

```mermaid
erDiagram
  meander_characteristics }o--|| characteristics : characteristic
  meander_characteristics }o--|| meanders : meander
  aggregate_markers {
    int id PK "not nullable"
    int meanderCount "not nullable"
  }
  characteristics {
    int id PK "not nullable"
    string category "not nullable"
    string description "not nullable"
    string documentationUrl "nullable"
    string formula "nullable"
    boolean isPattern "not nullable"
    string key "not nullable"
    int meanderCount "not nullable"
    string name "not nullable"
    string valueType "not nullable"
  }
  characteristic_pair_counts {
    int characteristicId PK "not nullable"
    int otherCharacteristicId PK "not nullable"
    float otherValue PK "not nullable"
    float value PK "not nullable"
    int meanderCount "not nullable"
  }
  characteristic_shape_counts {
    int characteristicId PK "not nullable"
    int columns PK "not nullable"
    int rows PK "not nullable"
    float value PK "not nullable"
    int meanderCount "not nullable"
  }
  characteristic_value_counts {
    int characteristicId PK "not nullable"
    float value PK "not nullable"
    int meanderCount "not nullable"
  }
  meanders {
    string id PK "not nullable"
    string code "not nullable"
    int columns "not nullable"
    date createdAt "not nullable"
    string createdBy "nullable"
    boolean isHardcoded "not nullable"
    string lattice "not nullable"
    int repeats "not nullable"
    int rows "not nullable"
    simple-array symmetricalCodes "not nullable"
    date updatedAt "not nullable"
    string updatedBy "nullable"
  }
  meander_characteristics {
    int characteristicId PK "not nullable"
    string meanderId PK "not nullable"
    float value "not nullable"
  }
  shape_counts {
    int columns PK "not nullable"
    int rows PK "not nullable"
    int meanderCount "not nullable"
  }
```

<!-- postgresql-erd:end -->
