/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('test');

// Search for documents in the current collection.
db.getCollection('products')
.deleteOne({
  _id: ObjectId("68ba71c70c25917a32868d55")  // 👉 실제 ObjectId 값 넣기
});
