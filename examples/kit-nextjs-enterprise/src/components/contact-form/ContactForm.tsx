'use client';

import React, { useState } from 'react';
import { Text, RichText } from '@sitecore-content-sdk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ContactFormProps } from './contact-form.props';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Form validation schema
 */
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

/**
 * Default Contact Form
 */
export const Default: React.FC<ContactFormProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light', layout = 'standard' } = params || {};
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  if (!fields) {
    return <NoDataFallback componentName="ContactForm" />;
  }

  const {
    title,
    subtitle,
    description,
    nameLabel,
    emailLabel,
    companyLabel,
    phoneLabel,
    messageLabel,
    submitButtonText,
    successMessage,
    errorMessage,
  } = fields;

  const onSubmit = async (data: FormData) => {
    setSubmitStatus('loading');

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Form submitted:', data);
      setSubmitStatus('success');
      reset();
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn('mx-auto', layout === 'narrow' ? 'max-w-xl' : 'max-w-4xl')}
        >
          {/* Header */}
          <div className="mb-10 text-center">
            {(title?.value || isPageEditing) && (
              <Text
                tag="h2"
                field={title}
                className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              />
            )}
            {(subtitle?.value || isPageEditing) && (
              <Text tag="p" field={subtitle} className="mb-2 text-xl text-muted-foreground" />
            )}
            {(description?.value || isPageEditing) && (
              <RichText field={description} className="text-muted-foreground" />
            )}
          </div>

          {/* Form */}
          <Card>
            <CardContent className="p-6 lg:p-8">
              {submitStatus === 'success' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle className="mb-4 h-16 w-16 text-pastel-green" />
                  <Text
                    tag="p"
                    field={successMessage}
                    className="text-lg font-medium"
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {nameLabel?.value || 'Name'} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        {...register('name')}
                        className={cn(errors.name && 'border-destructive')}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {emailLabel?.value || 'Email'} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        {...register('email')}
                        className={cn(errors.email && 'border-destructive')}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Company Field */}
                    <div className="space-y-2">
                      <Label htmlFor="company">{companyLabel?.value || 'Company'}</Label>
                      <Input
                        id="company"
                        placeholder="Acme Inc."
                        {...register('company')}
                      />
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">{phoneLabel?.value || 'Phone'}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...register('phone')}
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {messageLabel?.value || 'Message'} <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      rows={5}
                      {...register('message')}
                      className={cn(errors.message && 'border-destructive')}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Error Message */}
                  {submitStatus === 'error' && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <Text tag="span" field={errorMessage} />
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={submitStatus === 'loading'}
                  >
                    {submitStatus === 'loading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      submitButtonText?.value || 'Send Message'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

/**
 * Compact Contact Form - Inline form for simpler use cases
 */
export const Compact: React.FC<ContactFormProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'pink' } = params || {};
  const [email, setEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!fields) {
    return <NoDataFallback componentName="ContactForm (Compact)" />;
  }

  const { title, subtitle, submitButtonText, successMessage } = fields;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setEmail('');
    } catch {
      setSubmitStatus('error');
    }
  };

  const bgColor = {
    pink: 'bg-pastel-pink',
    peach: 'bg-pastel-peach',
    yellow: 'bg-pastel-yellow',
    green: 'bg-pastel-green',
  }[colorScheme] || 'bg-pastel-pink';

  return (
    <section className={cn('py-12', bgColor, params?.styles)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          {(title?.value || isPageEditing) && (
            <Text tag="h3" field={title} className="mb-2 text-2xl font-bold" />
          )}
          {(subtitle?.value || isPageEditing) && (
            <Text tag="p" field={subtitle} className="mb-6 text-lg opacity-80" />
          )}

          {submitStatus === 'success' ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <Text tag="span" field={successMessage} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white"
              />
              <Button type="submit" variant="secondary" disabled={submitStatus === 'loading'}>
                {submitStatus === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  submitButtonText?.value || 'Subscribe'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
