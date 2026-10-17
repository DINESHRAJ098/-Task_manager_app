import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { isUsingMemoryFallback } from '../config/db.js';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IUserDocument extends Document, Omit<IUser, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Hash password with bcrypt before saving to MongoDB
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: Verify entered password against hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Real Mongoose Model
export const MongooseUserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);

// Memory fallback store for environments without active MongoDB daemon
interface InMemoryUser extends IUser {
  _id: string;
}

const initialHashedPassword = bcrypt.hashSync('Password123!', 10);

const memoryUsers: InMemoryUser[] = [
  {
    _id: '65f01a111111111111111101',
    name: 'Alex Developer',
    email: 'alex@example.com',
    password: initialHashedPassword,
    createdAt: new Date('2026-01-10T10:00:00.000Z'),
    updatedAt: new Date('2026-01-10T10:00:00.000Z'),
    async matchPassword(enteredPassword: string) {
      return bcrypt.compare(enteredPassword, this.password);
    },
  },
];

// Unified UserModel proxy that directs calls to Mongoose or memory store
export const UserModel = {
  async findOne(filter: { email?: string; _id?: string }): Promise<IUser | null> {
    if (!isUsingMemoryFallback && mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseUserModel.findOne(filter);
        if (doc) {
          const obj = doc.toObject() as unknown as IUser;
          obj._id = doc._id.toString();
          obj.matchPassword = (p: string) => doc.matchPassword(p);
          return obj;
        }
        return null;
      } catch (e) {
        console.warn('Mongoose query failed, using memory store fallback:', e);
      }
    }

    const email = filter.email?.toLowerCase();
    const found = memoryUsers.find(
      (u) => (email && u.email === email) || (filter._id && u._id === filter._id)
    );
    return found ? { ...found } : null;
  },

  async findById(id: string): Promise<IUser | null> {
    if (!isUsingMemoryFallback && mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseUserModel.findById(id).select('-password');
        if (doc) {
          const obj = doc.toObject() as unknown as IUser;
          obj._id = doc._id.toString();
          return obj;
        }
        return null;
      } catch (e) {
        console.warn('Mongoose findById failed, falling back:', e);
      }
    }

    const found = memoryUsers.find((u) => u._id === id);
    if (!found) return null;
    const { password, ...rest } = found;
    return { ...rest, password: '' } as IUser;
  },

  async create(userData: { name: string; email: string; password: string }): Promise<IUser> {
    if (!isUsingMemoryFallback && mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseUserModel.create(userData);
        const obj = doc.toObject() as unknown as IUser;
        obj._id = doc._id.toString();
        obj.matchPassword = (p: string) => doc.matchPassword(p);
        return obj;
      } catch (e) {
        console.warn('Mongoose create failed, using memory store:', e);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser: InMemoryUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      async matchPassword(enteredPassword: string) {
        return bcrypt.compare(enteredPassword, this.password);
      },
    };
    memoryUsers.push(newUser);
    return { ...newUser };
  },
};
