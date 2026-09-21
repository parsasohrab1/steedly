import { Controller, Get, NotFoundException, Query } from '@nestjs/common';

/**
 * Thin proxy over Wikipedia's public REST summary API — used so breed (and other
 * reference) photos come from a real, live source instead of a hardcoded/guessed
 * Wikimedia file URL. No auth needed; this is Wikipedia's documented public API,
 * designed for exactly this kind of "get me a summary + thumbnail for a topic" use.
 */
@Controller('v1/wiki-summary')
export class WikiController {
  @Get()
  async summary(@Query('title') title: string, @Query('lang') lang = 'en') {
    if (!title) throw new NotFoundException('title query param is required');

    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!res.ok) throw new NotFoundException(`No Wikipedia summary found for "${title}"`);
    const body = await res.json();

    return {
      title: body.title,
      extract: body.extract,
      thumbnailUrl: body.thumbnail?.source ?? null,
      pageUrl: body.content_urls?.desktop?.page ?? null,
    };
  }
}
