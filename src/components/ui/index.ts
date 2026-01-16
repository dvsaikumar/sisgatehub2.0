/**
 * UI Components Barrel File
 * 
 * Export all shadcn/ui style components from a single entry point.
 * Import like: import { Button, Card, Input } from '@/components/ui';
 */

export { Button, buttonVariants } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Input } from './input';
export { Badge, badgeVariants } from './badge';
export { DataTable, type ColumnDef } from './data-table';
export { RichTextEditor, useEditor } from './rich-text-editor';

