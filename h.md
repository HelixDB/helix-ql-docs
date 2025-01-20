
# Helix Query Language Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Schema Definition](#schema-definition)
3. [Query Structure](#query-structure)
4. [Traversal Steps](#traversal-steps)
5. [Operations](#operations)
6. [Property Access](#property-access)
7. [Examples](#examples)

## Introduction

Helix Query Language (HQL) is a graph query language designed for traversing and manipulating graph databases. It provides a declarative way to define schemas, query data, and perform graph operations.

## Schema Definition

### Node Schema
Defines vertex types and their properties in the graph.

```helix
V::Person {
    Name: String,
    Age: Integer,
    Active: Boolean,
    Score: Float
}
```

### Edge Schema 
Defines relationships between nodes and their properties.

```helix
E::Follows {
    From: Person,
    To: Person,
    Properties {
        Since: String,
        Weight: Float
    }
}
```

## Query Structure

### Basic Query Syntax
```helix
QUERY QueryName(param1, param2) =>
    result <- traversal_expression
    RETURN result
```

### Components:
- `QUERY`: Keyword to start a query definition
- `QueryName`: Identifier for the query
- `parameters`: Input parameters in parentheses
- `=>`: Separates query header from body
- `<-`: Assignment operator
- `RETURN`: Specifies output values

## Traversal Steps

### Starting Points

1. **Vertex Selection**
```helix
// All vertices
V()

// Vertices of specific type
V<Person>()

// Vertex by ID
V("123")

// Vertices of type with IDs
V<Person>("123", "456")
```

2. **Edge Selection**
```helix
// All edges
E()

// Edges of specific type
E<Follows>

// Edge by ID
E("789")

// Edge of type with IDs
E<Follows>("123", "456")
```

### Navigation Steps

1. **Outgoing Traversal**
```helix
// Traverse to outgoing vertices
::Out()

// Traverse to outgoing vertices with edge type
::Out<Follows>()

// Traverse to outgoing edges
::OutE()

// Traverse to outgoing edges with edge type
::OutE<Follows>()
```

2. **Incoming Traversal**
```helix
// Traverse to incoming vertices
::In()

// Traverse to incoming vertices with edge type
::In<Follows>()

// Traverse to incoming edges
::InE()

// Traverse to incoming edges with edge type
::InE<Follows>()  
```

3. **Bidirectional Traversal**
```helix
// Traverse both directions for vertices
::Both()

// Traverse both directions for vertices with edge type
::Both<Follows>()

// Traverse both directions for edges
::BothE()

// Traverse both directions for edges with edge type
::BothE<Follows>()
```

4. **Vertex From Edge**
```helix
::OutV()  // Get source vertex
::InV()   // Get target vertex
::BothV() // Get both vertices
```

## Operations

### Adding Elements

1. **Adding Vertices**
```helix
// Add vertex with type
AddV<Person>()

// Add vertex with properties
AddV<Person>({
    Name: "Alice",
    Age: 30
})
```

2. **Adding Edges**
```helix
// Add edge between vertices
AddE<Follows>()::From(vertex1)::To(vertex2)

// Add edge with properties
AddE<Follows>({
    Since: "2024",
    Weight: 0.8
})::From(vertex1)::To(vertex2)
```

### Filtering

1. **Where Clause**
```helix
::WHERE(_::Props(Age)::GT(25))
```

2. **Boolean Operations**
```helix
// Greater than
::GT(value)

// Less than
::LT(value)

// Equals
::EQ(value)

// Not equals
::NEQ(value)

// Greater than or equal
::GTE(value)

// Less than or equal
::LTE(value)
```

3. **Existence Check**
```helix
EXISTS(traversal_expression)
```

### Property Operations

1. **Property Access**
```helix
// Get specific properties
::Props(Name, Age)
```

2. **Property Addition**
```helix
// Add/update properties
::{
    NewField: "value",
    ComputedField: _::Out<Follows>::COUNT
}
```

### Aggregation

1. **Count**
```helix
::COUNT
```

## Examples

### 1. Find Users Over 25 with Followers
```helix
QUERY FindActiveUsers() =>
    users <- V<Person>()::WHERE(_::Props(Age)::GT(25))
    withFollowers <- users::WHERE(EXISTS(_::In<Follows>))
    RETURN withFollowers
```

### 2. Create Friendship Between Users
```helix
QUERY CreateFriendship(user1Id, user2Id) =>
    user1 <- V<Person>(user1Id)
    user2 <- V<Person>(user2Id)
    friendship <- AddE<Follows>({Since: "2024"})::From(user1)::To(user2)
    RETURN friendship
```

### 3. Get User's Friends with Age
```helix
QUERY GetFriendsWithAge(userId) =>
    user <- V<Person>(userId)
    friends <- user::Out<Follows>::InV::Props(Name, Age)
    RETURN friends
```

### 4. Complex Network Analysis
```helix
QUERY AnalyzeNetwork(userId) =>
    user <- V<Person>(userId)
    activeConnections <- user::Out<Follows>
        ::WHERE(_::Props(Weight)::GT(0.5))
        ::InV
        ::WHERE(_::Out::COUNT::GT(5))
    result <- activeConnections::{
        Name: _::Props(Name),
        ConnectionCount: _::Out::COUNT
    }
    RETURN result
```

## Best Practices

1. **Query Organization**
   - Break complex queries into smaller, reusable parts
   - Use meaningful variable names
   - Comment complex traversals

2. **Performance**
   - Filter early in traversals to reduce data set
   - Use specific vertex/edge types when possible
   - Avoid unnecessary property access

3. **Schema Design**
   - Use clear, consistent naming conventions
   - Define appropriate property types
   - Document relationships between vertex types