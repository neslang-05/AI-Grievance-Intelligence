-- Create storage buckets for complaints
insert into storage.buckets (id, name, public)
values ('image-complaints', 'image-complaints', true);

insert into storage.buckets (id, name, public)
values ('voice-complaints', 'voice-complaints', true);

-- Allow public access to read files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id in ('image-complaints', 'voice-complaints') );

-- Allow authenticated users to upload files
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id in ('image-complaints', 'voice-complaints') );
