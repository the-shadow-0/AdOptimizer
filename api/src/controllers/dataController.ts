import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

process.env.DATABASE_URL = "file:./dev.db";

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter, log: ['info'] });

export const getWorkspace = async (req: Request, res: Response) => {
  try {
    const workspace = await prisma.workspace.findFirst({
      include: { integrations: true }
    });
    res.json(workspace);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaignGoal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const updateCampaignStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const campaign = await prisma.campaignGoal.update({
      where: { id: String(id) },
      data: { status }
    });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const getExperiments = async (req: Request, res: Response) => {
  try {
    const experiments = await prisma.experiment.findMany({
      include: {
        campaignGoal: true,
        creativeAsset: true,
        audience: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format to match UI
    const formatted = experiments.map(e => ({
      id: e.id,
      variantName: `${e.platform} - ${e.audience.name}`,     
      campaign: e.campaignGoal.name,
      platform: e.platform,
      spend: `$${e.spend.toLocaleString()}`,
      roas: `${e.roas}x`,
      roasTrend: e.trend,
      cpa: `$${e.cpa}`,
      status: e.status
    }));
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const updateExperimentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const experiment = await prisma.experiment.update({
      where: { id: String(id) },
      data: { status }
    });
    res.json({ success: true, experiment });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const getAudiences = async (req: Request, res: Response) => {
  try {
    const audiences = await prisma.audience.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(audiences);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const reclusterAudience = async (req: Request, res: Response) => {
  try {
    // Artificial delay to simulate AI clustering
    await new Promise(resolve => setTimeout(resolve, 2500));
    res.json({ success: true, message: 'Clusters Refreshed' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const getCreatives = async (req: Request, res: Response) => {
  try {
    const creatives = await prisma.creativeAsset.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(creatives);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const updateWorkspace = async (req: Request, res: Response) => {
  try {
    const { name, timezone, currency } = req.body;
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }
    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        ...(name && { name }),
        ...(timezone && { timezone }),
        ...(currency && { currency }),
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    // Get or auto-create the default user for this workspace
    let user = await prisma.user.findFirst();
    if (!user) {
      const workspace = await prisma.workspace.findFirst();
      if (!workspace) {
        res.status(404).json({ error: 'No workspace found' });
        return;
      }
      user = await prisma.user.create({
        data: {
          workspaceId: workspace.id,
          fullName: 'John Doe',
          email: 'john@acmecorp.com',
          avatarInitials: 'JD',
        }
      });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email } = req.body;
    let user = await prisma.user.findFirst();
    if (!user) {
      const workspace = await prisma.workspace.findFirst();
      if (!workspace) {
        res.status(404).json({ error: 'No workspace found' });
        return;
      }
      user = await prisma.user.create({
        data: {
          workspaceId: workspace.id,
          fullName: fullName || 'John Doe',
          email: email || 'john@acmecorp.com',
          avatarInitials: fullName
            ? fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
            : 'JD',
        }
      });
    } else {
      const avatarInitials = fullName
        ? fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
        : user.avatarInitials;

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(fullName !== undefined && { fullName, avatarInitials }),
          ...(email !== undefined && { email }),
        }
      });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
