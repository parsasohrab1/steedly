import { Request, Response, NextFunction } from 'express';
import { query } from '../database/connection';
import { createError } from '../middleware/errorHandler';
import { getCache, setCache } from '../database/redis';

// Advanced search across all content types
export const globalSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q, type, category, sort, page = 1, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return next(createError('Search query must be at least 2 characters', 400));
    }

    const searchQuery = `%${q}%`;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const results: any = {
      blog: [],
      products: [],
      competitions: []
    };

    // Search blog posts
    if (!type || type === 'blog' || type === 'all') {
      let blogQuery = `
        SELECT 
          bp.id, bp.title, bp.slug, bp.excerpt, bp.featured_image,
          bp.published_at, bc.name as category_name
        FROM blog_posts bp
        LEFT JOIN blog_categories bc ON bp.category_id = bc.id
        WHERE bp.is_published = true
          AND (
            bp.title ILIKE $1 OR 
            bp.content ILIKE $1 OR 
            bp.excerpt ILIKE $1
          )
      `;
      const params: any[] = [searchQuery];
      let paramCount = 2;

      if (category) {
        blogQuery += ` AND bc.slug = $${paramCount++}`;
        params.push(category);
      }

      blogQuery += ` ORDER BY bp.published_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const blogResult = await query(blogQuery, params);
      results.blog = blogResult.rows;
    }

    // Search products
    if (!type || type === 'product' || type === 'all') {
      let productQuery = `
        SELECT 
          p.id, p.name, p.slug, p.short_description, p.price,
          p.images, p.images[1] as image_url, pc.name as category_name
        FROM products p
        LEFT JOIN product_categories pc ON p.category_id = pc.id
        WHERE p.is_active = true
          AND (
            p.name ILIKE $1 OR 
            p.description ILIKE $1 OR 
            p.short_description ILIKE $1
          )
      `;
      const params: any[] = [searchQuery];
      let paramCount = 2;

      if (category) {
        productQuery += ` AND pc.slug = $${paramCount++}`;
        params.push(category);
      }

      productQuery += ` ORDER BY p.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const productResult = await query(productQuery, params);
      results.products = productResult.rows;
    }

    // Search competitions
    if (!type || type === 'competition' || type === 'all') {
      let compQuery = `
        SELECT 
          id, title, slug, description, competition_type,
          location, start_date, image_url
        FROM competitions
        WHERE is_published = true
          AND (
            title ILIKE $1 OR 
            description ILIKE $1
          )
      `;
      const params: any[] = [searchQuery];
      let paramCount = 2;

      if (category) {
        compQuery += ` AND competition_type = $${paramCount++}`;
        params.push(category);
      }

      compQuery += ` ORDER BY start_date DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const compResult = await query(compQuery, params);
      results.competitions = compResult.rows;
    }

    // Sort results if needed
    if (sort === 'date') {
      // Results are already sorted by date
    } else if (sort === 'relevance') {
      // Simple relevance: prioritize title matches
      const prioritizeTitle = (arr: any[]) => {
        return arr.sort((a, b) => {
          const aTitleMatch = a.title?.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
          const bTitleMatch = b.title?.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
          return bTitleMatch - aTitleMatch;
        });
      };
      results.blog = prioritizeTitle(results.blog);
      results.products = prioritizeTitle(results.products);
      results.competitions = prioritizeTitle(results.competitions);
    }

    res.json({
      success: true,
      data: {
        query: q,
        results,
        total: results.blog.length + results.products.length + results.competitions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

