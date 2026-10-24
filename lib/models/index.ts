import mongoose, { Schema, type Model } from "mongoose";

function model<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

export const SiteDoc = model(
  "SiteDoc",
  new Schema({ key: { type: String, unique: true }, data: Schema.Types.Mixed }, { timestamps: true, minimize: false })
);

export const Message = model(
  "Message",
  new Schema(
    {
      name: String,
      email: String,
      subject: String,
      message: String,
      read: { type: Boolean, default: false },
      starred: { type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

export const Media = model(
  "Media",
  new Schema({ name: String, mime: String, size: Number, data: Buffer }, { timestamps: true })
);

export const AdminUser = model(
  "AdminUser",
  new Schema({ email: { type: String, unique: true }, passwordHash: String }, { timestamps: true })
);

export const DayStat = model(
  "DayStat",
  new Schema({ day: { type: String, unique: true }, views: { type: Number, default: 0 } })
);
