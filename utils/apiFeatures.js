

class apiFeatures {
  constructor(query, querystring) {
    this.query = query;
    this.querystring = querystring;
  }

  filter() {
    const queryobj = { ...this.querystring };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryobj[el]);
  
    if (queryobj.region) {
      queryobj["address.region"] = queryobj.region;
      delete queryobj.region;
    }
  
    if (queryobj.Class) {
      queryobj.Class = Number(queryobj.Class); // تأكد أنه رقم
    }
  
    // معالجة عوامل المقارنة مثل gte و lte
    let queryStr = JSON.stringify(queryobj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const queryjson = JSON.parse(queryStr);
  
    this.query = this.query.find(queryjson);
    return this;
  }
  
  sorting() {
    if (this.querystring.sort) {
      const sortby = this.querystring.sort.split(",").join(" ");
      this.query = this.query.sort(sortby);
    } else {
      this.query = this.query.sort("createdAt");
    }
    return this
  }

  limitField() {
    if (this.querystring.fields) {
      const fields = this.querystring.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this
  }

  pagination() {
    const page = this.querystring.page * 1 || 1;
    const limit = this.querystring.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this
  }
}
module.exports =apiFeatures