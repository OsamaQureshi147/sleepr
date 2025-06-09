import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { Logger, NotFoundException } from '@nestjs/common';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;
  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    const savedDocument = (
      await createdDocument.save()
    ).toJSON() as unknown as TDocument;
    return savedDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model
      .findOne(filterQuery)
      .lean<TDocument>(true);
    if (!document) {
      this.logger.warn(
        'Document was not found with filter query: ',
        filterQuery,
      );
      throw new NotFoundException('Document was not found');
    }
    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<TDocument>(true);
    if (!document) {
      this.logger.warn(
        'Document was not found with filter query: ',
        filterQuery,
      );
      throw new NotFoundException('Document was not found');
    }
    return document;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    const documents = await this.model
      .find(filterQuery)
      .lean<TDocument[]>(true);
    return documents;
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const deletedDocument = await this.model
      .findOneAndDelete(filterQuery)
      .lean<TDocument>(true);
    if (!deletedDocument) {
      this.logger.warn(
        'Document was not found with filter query: ',
        filterQuery,
      );
      throw new NotFoundException(
        'Document cannot be deleted as it was not found',
      );
    }
    return deletedDocument;
  }
}
