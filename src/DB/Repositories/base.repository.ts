import {
  ClientSession,
  CreateOptions,
  DeleteResult,
  HydratedDocument,
  InsertManyOptions,
  Model,
  MongooseBaseQueryOptions,
  MongooseUpdateQueryOptions,
  ObjectId,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  UpdateQuery,
  UpdateResult,
} from "mongoose";

type SingleCreateOptions = {
  session?: ClientSession;
};

abstract class BaseRepository<TModel> {
  constructor(private readonly model: Model<TModel>) {}

  //*   Create methods
  //-----> -1- Create One Or Many Overloads
  create({
    data,
    options,
  }: {
    data: Partial<TModel>;
    options?: (CreateOptions & SingleCreateOptions) | undefined;
  }): Promise<HydratedDocument<TModel>>;

  create({ data, options }: { data: Partial<TModel>[]; options?: CreateOptions | undefined }): Promise<HydratedDocument<TModel>[]>;
  
  create({
    data,
    options,
  }: {
    data: Partial<TModel> | Partial<TModel>[];
    options?: (SingleCreateOptions & CreateOptions) | CreateOptions | undefined;
  }): Promise<HydratedDocument<TModel>[] | HydratedDocument<TModel>> {
    return this.model.create(data as any, options);
  }

  //-----> -2- insertMany Method
  async insertMany({ data, options }: { data: Partial<TModel>[]; options?: InsertManyOptions }): Promise<HydratedDocument<TModel>[]> {
    const docs = options ? await this.model.insertMany(data, options) : await this.model.insertMany(data);
    return docs as unknown as HydratedDocument<TModel>[];
  }

  //*   Find methods
  //-----> -3- findOne Method Overloads
  findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TModel>;
    projection?: ProjectionType<TModel> | null;
    options?: QueryOptions<TModel> & { lean?: true };
  }): Promise<TModel | null>;

  findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TModel>;
    projection?: ProjectionType<TModel> | null;
    options?: QueryOptions<TModel>;
  }): Promise<HydratedDocument<TModel> | null>;

  findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TModel>;
    projection?: ProjectionType<TModel> | null;
    options?: QueryOptions<TModel> & { lean?: boolean };
  }): Promise<TModel | HydratedDocument<TModel> | null> {
    const { populate, lean, session, ...otherOptions } = options || {};

    let query = this.model.findOne(filter, projection, otherOptions);
    if (populate) query.populate(populate as PopulateOptions | (string | PopulateOptions)[]);
    if (lean) query.lean(lean);
    if (session) query.session(session);
    return query.exec();
  }

  //-----> -4- findById Method Overloads
  findById({
    id,
    projection,
    options,
  }: {
    id: string | ObjectId;
    projection?: ProjectionType<TModel> | null | undefined;
    options?: QueryOptions<TModel> & { lean?: true };
  }): Promise<TModel | null>;

  findById({
    id,
    projection,
    options,
  }: {
    id: string | ObjectId;
    projection?: ProjectionType<TModel> | null | undefined;
    options?: QueryOptions<TModel>;
  }): Promise<HydratedDocument<TModel> | null>;

  findById({
    id,
    projection,
    options,
  }: {
    id: string | ObjectId;
    projection?: ProjectionType<TModel> | null | undefined;
    options?: QueryOptions<TModel> & { lean?: boolean };
  }): Promise<TModel | HydratedDocument<TModel> | null> {
    const { populate, lean, session, ...otherOptions } = options || {};
    let query = this.model.findById(id, projection, otherOptions);
    if (populate) query.populate(populate as PopulateOptions | (string | PopulateOptions)[]);
    if (lean) query.lean(lean);
    if (session) query.session(session);

    return query.exec();
  }

  //-----> -4- find Method Overloads
  find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TModel>;
    projection?: ProjectionType<TModel> | null | undefined;
    options?: QueryOptions<TModel> & { lean?: true };
  }): Promise<TModel[]>;

  find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TModel>;
    projection?: ProjectionType<TModel> | null | undefined;
    options?: QueryOptions<TModel>;
  }): Promise<HydratedDocument<TModel>[]>;

  find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TModel>;
    projection?: ProjectionType<TModel> | null | undefined;
    options?: QueryOptions<TModel> & { lean?: boolean };
  }): Promise<TModel[] | HydratedDocument<TModel>[]> {
    const { populate, lean, sort, skip, limit, session, ...otherOptions } = options || {};

    let query = this.model.find(filter, projection, otherOptions);
    if (populate) query.populate(populate as PopulateOptions | (string | PopulateOptions)[]);
    if (lean) query.lean(lean);
    if (sort !== undefined) query.sort(sort);
    if (skip !== undefined) query.skip(skip);
    if (limit !== undefined) query.limit(limit);
    if (session) query.session(session);

    return query.exec();
  }

  //*   Update methods
  //-----> -5- updateOne Method
  updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TModel>;
    update: UpdateQuery<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession };
  }): Promise<UpdateResult> {
    const { session, ...otherOptions } = options || {};
    let query = this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, { ...otherOptions, runValidators: true });
    if (session) query.session(session);

    return query.exec();
  }
  //-----> -6- updateMany Method
  updateMany({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TModel>;
    update: UpdateQuery<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession };
  }): Promise<UpdateResult> {
    const { session, ...otherOptions } = options || {};
    let query = this.model.updateMany(filter, { ...update, $inc: { __v: 1 } }, { ...otherOptions, runValidators: true });
    if (session) query.session(session);

    return query.exec();
  }

  //-----> -7- findOneAndUpdate Method overlads
  findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TModel>;
    update: UpdateQuery<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession } & { lean?: true };
  }): Promise<TModel | null>;
  findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TModel>;
    update: UpdateQuery<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession };
  }): Promise<HydratedDocument<TModel> | null>;
  findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TModel>;
    update: UpdateQuery<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession } & { lean?: boolean };
  }): Promise<HydratedDocument<TModel> | TModel | null> {
    const { session, lean, ...otherOptions } = options || {};
    let query = this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, { ...otherOptions, runValidators: true, new: true });
    if (lean) query.lean(lean);
    if (session) query.session(session);

    return query.exec();
  }

  //-----> -8- findByIdAndUpdate Method overlads
  findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: string | ObjectId;
    update: UpdateQuery<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession } & { lean?: true };
  }): Promise<TModel | null>;

  findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: string | ObjectId;
    update: UpdateQuery<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession };
  }): Promise<HydratedDocument<TModel> | null>;

  findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: string | ObjectId;
    update: UpdateQuery<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession } & { lean?: boolean };
  }): Promise<HydratedDocument<TModel> | TModel | null> {
    const { session, lean, ...otherOptions } = options || {};
    let query = this.model.findByIdAndUpdate(id, { ...update, $inc: { __v: 1 } }, { ...otherOptions, runValidators: true, new: true });
    if (lean) query.lean(lean);
    if (session) query.session(session);
    return query.exec();
  }

  //-----> -9- findOneAndReplace Method overlads
  findOneAndReplace({
    filter,
    replacement,
    options,
  }: {
    filter: QueryFilter<TModel>;
    replacement: Partial<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession } & { lean?: true };
  }): Promise<TModel | null>;

  findOneAndReplace({
    filter,
    replacement,
    options,
  }: {
    filter: QueryFilter<TModel>;
    replacement: Partial<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession };
  }): Promise<HydratedDocument<TModel> | null>;

  findOneAndReplace({
    filter,
    replacement,
    options,
  }: {
    filter: QueryFilter<TModel>;
    replacement?: Partial<TModel>;
    options?: MongooseUpdateQueryOptions<TModel> & { session?: ClientSession } & { lean?: boolean };
  }): Promise<HydratedDocument<TModel> | TModel | null> {
    const { session, lean, ...otherOptions } = options || {};
    let query = this.model.findOneAndReplace(filter, replacement, { ...otherOptions, runValidators: true, new: true });
    if (lean) query.lean(lean);
    if (session) query.session(session);
    return query.exec();
  }

  //*   Delete methods
  //-----> -10- deleteOne Method
  deleteOne({
    filter,
    options,
  }: {
    filter: QueryFilter<TModel>;
    options?: MongooseBaseQueryOptions<TModel> & { session?: ClientSession };
  }): Promise<DeleteResult> {
    const { session, ...otherOptions } = options || {};
    let query = this.model.deleteOne(filter, otherOptions);
    if (session) query.session(session);

    return query.exec();
  }

  //-----> -11- deleteMany Method
  deleteMany({
    filter,
    options,
  }: {
    filter: QueryFilter<TModel>;
    options?: MongooseBaseQueryOptions<TModel> & { session?: ClientSession };
  }): Promise<DeleteResult> {
    const { session, ...otherOptions } = options || {};
    let query = this.model.deleteMany(filter, otherOptions);
    if (session) query.session(session);
    return query.exec();
  }

  //-----> -12- findOneAndDelete Method overlads
  findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<TModel>;
    options?: QueryOptions<TModel> & { session?: ClientSession } & { lean?: true };
  }): Promise<TModel | null>;

  findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<TModel>;
    options?: QueryOptions<TModel> & { session?: ClientSession };
  }): Promise<HydratedDocument<TModel> | null>;

  findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<TModel>;
    options?: QueryOptions<TModel> & { session?: ClientSession } & { lean?: boolean };
  }): Promise<HydratedDocument<TModel> | TModel | null> {
    const { session, lean, ...otherOptions } = options || {};
    let query = this.model.findOneAndDelete(filter, otherOptions);
    if (lean) query.lean(lean);
    if (session) query.session(session);
    return query.exec();
  }

  //-----> -13- findByIdAndDelete Method overlads
  findByIdAndDelete({
    id,
    options,
  }: {
    id: string | ObjectId;
    options?: QueryOptions<TModel> & { session?: ClientSession } & { lean?: true };
  }): Promise<TModel | null>;

  findByIdAndDelete({
    id,
    options,
  }: {
    id: string | ObjectId;
    options?: QueryOptions<TModel> & { session?: ClientSession };
  }): Promise<HydratedDocument<TModel> | null>;

  findByIdAndDelete({
    id,
    options,
  }: {
    id: string | ObjectId;
    options?: QueryOptions<TModel> & { session?: ClientSession } & { lean?: boolean };
  }): Promise<HydratedDocument<TModel> | TModel | null> {
    const { session, lean, ...otherOptions } = options || {};
    let query = this.model.findByIdAndDelete(id, otherOptions);
    if (lean) query.lean(lean);
    if (session) query.session(session);
    return query.exec();
  }
}

export default BaseRepository;
