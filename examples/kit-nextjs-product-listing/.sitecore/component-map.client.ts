// Client-safe component map for App Router
import { BYOCWrapper, NextjsContentSdkComponent, FEaaSWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';
import * as zipcodemodaldev from 'src/components/zipcode-modal/zipcode-modal.dev';
import * as VerticalImageAccordion from 'src/components/vertical-image-accordion/VerticalImageAccordion';
import * as themeproviderdev from 'src/components/theme-provider/theme-provider.dev';
import * as TextBannerTextTopdev from 'src/components/text-banner/TextBannerTextTop.dev';
import * as TextBannerDefaultdev from 'src/components/text-banner/TextBannerDefault.dev';
import * as TextBannerBlueTitleRightdev from 'src/components/text-banner/TextBannerBlueTitleRight.dev';
import * as TextBanner02dev from 'src/components/text-banner/TextBanner02.dev';
import * as TextBanner01dev from 'src/components/text-banner/TextBanner01.dev';
import * as TextBanner from 'src/components/text-banner/TextBanner';
import * as TestimonialCarousel from 'src/components/testimonial-carousel/TestimonialCarousel';
import * as Title from 'src/components/sxa/Title';
import * as PageContent from 'src/components/sxa/PageContent';
import * as Navigation from 'src/components/sxa/Navigation';
import * as LinkList from 'src/components/sxa/LinkList';
import * as Image from 'src/components/sxa/Image';
import * as SubscriptionBanner from 'src/components/subscription-banner/SubscriptionBanner';
import * as SubmissionFormDefaultdev from 'src/components/submission-form/SubmissionFormDefault.dev';
import * as SubmissionFormCentereddev from 'src/components/submission-form/SubmissionFormCentered.dev';
import * as SubmissionForm from 'src/components/submission-form/SubmissionForm';
import * as SlideCarouseldev from 'src/components/slide-carousel/SlideCarousel.dev';
import * as TextSlider from 'src/components/site-three/TextSlider';
import * as ProductPageHeader from 'src/components/site-three/ProductPageHeader';
import * as ProductComparison from 'src/components/site-three/ProductComparison';
import * as MultiPromo from 'src/components/site-three/MultiPromo';
import * as MobileMenuWrapper from 'src/components/site-three/MobileMenuWrapper';
import * as MegaMenuItemWrapper from 'src/components/site-three/MegaMenuItemWrapper';
import * as ImageCarousel from 'src/components/site-three/ImageCarousel';
import * as ImageBanner from 'src/components/site-three/ImageBanner';
import * as HeroST from 'src/components/site-three/HeroST';
import * as FeatureBanner from 'src/components/site-three/FeatureBanner';
import * as AccordionBlock from 'src/components/site-three/AccordionBlock';
import * as SearchBox from 'src/components/site-three/non-sitecore/SearchBox';
import * as MiniCart from 'src/components/site-three/non-sitecore/MiniCart';
import * as SecondaryNavigation from 'src/components/secondary-navigation/SecondaryNavigation';
import * as PromoImage from 'src/components/promo-image/PromoImage';
import * as PromoAnimatedImageRightdev from 'src/components/promo-animated/PromoAnimatedImageRight.dev';
import * as PromoAnimatedDefaultdev from 'src/components/promo-animated/PromoAnimatedDefault.dev';
import * as PromoAnimated from 'src/components/promo-animated/PromoAnimated';
import * as ProductListingThreeUpdev from 'src/components/product-listing/ProductListingThreeUp.dev';
import * as ProductListingSliderdev from 'src/components/product-listing/ProductListingSlider.dev';
import * as ProductListingDefaultdev from 'src/components/product-listing/ProductListingDefault.dev';
import * as ProductListing from 'src/components/product-listing/ProductListing';
import * as portaldev from 'src/components/portal/portal.dev';
import * as PageHeaderFiftyFiftydev from 'src/components/page-header/PageHeaderFiftyFifty.dev';
import * as PageHeaderDefaultdev from 'src/components/page-header/PageHeaderDefault.dev';
import * as PageHeaderCentereddev from 'src/components/page-header/PageHeaderCentered.dev';
import * as PageHeaderBlueTextdev from 'src/components/page-header/PageHeaderBlueText.dev';
import * as PageHeaderBlueBackgrounddev from 'src/components/page-header/PageHeaderBlueBackground.dev';
import * as PageHeader from 'src/components/page-header/PageHeader';
import * as MultiPromoTabs from 'src/components/multi-promo-tabs/MultiPromoTabs';
import * as modetoggledev from 'src/components/mode-toggle/mode-toggle.dev';
import * as MediaSectiondev from 'src/components/media-section/MediaSection.dev';
import * as meteors from 'src/components/magicui/meteors';
import * as LogoTabs from 'src/components/logo-tabs/LogoTabs';
import * as LocationSearchTitleZipCentereddev from 'src/components/location-search/LocationSearchTitleZipCentered.dev';
import * as LocationSearchMapTopAllCentereddev from 'src/components/location-search/LocationSearchMapTopAllCentered.dev';
import * as LocationSearchMapRightTitleZipCentereddev from 'src/components/location-search/LocationSearchMapRightTitleZipCentered.dev';
import * as LocationSearchMapRightdev from 'src/components/location-search/LocationSearchMapRight.dev';
import * as LocationSearchItemdev from 'src/components/location-search/LocationSearchItem.dev';
import * as LocationSearchDefaultdev from 'src/components/location-search/LocationSearchDefault.dev';
import * as LocationSearch from 'src/components/location-search/LocationSearch';
import * as GoogleMapdev from 'src/components/location-search/GoogleMap.dev';
import * as ImageGalleryNoSpacingdev from 'src/components/image-gallery/ImageGalleryNoSpacing.dev';
import * as ImageGalleryGriddev from 'src/components/image-gallery/ImageGalleryGrid.dev';
import * as ImageGalleryFiftyFiftydev from 'src/components/image-gallery/ImageGalleryFiftyFifty.dev';
import * as ImageGalleryFeaturedImagedev from 'src/components/image-gallery/ImageGalleryFeaturedImage.dev';
import * as ImageGallerydev from 'src/components/image-gallery/ImageGallery.dev';
import * as ImageGallery from 'src/components/image-gallery/ImageGallery';
import * as nextImageSrcdev from 'src/components/image/nextImageSrc.dev';
import * as ImageWrapperdev from 'src/components/image/ImageWrapper.dev';
import * as imageoptimizationcontext from 'src/components/image/image-optimization.context';
import * as Icon from 'src/components/icon/Icon';
import * as HeroImageRightdev from 'src/components/hero/HeroImageRight.dev';
import * as HeroImageBottomInsetdev from 'src/components/hero/HeroImageBottomInset.dev';
import * as HeroImageBottomdev from 'src/components/hero/HeroImageBottom.dev';
import * as HeroImageBackgrounddev from 'src/components/hero/HeroImageBackground.dev';
import * as HeroDefaultdev from 'src/components/hero/HeroDefault.dev';
import * as Hero from 'src/components/hero/Hero';
import * as GlobalHeaderDefaultdev from 'src/components/global-header/GlobalHeaderDefault.dev';
import * as GlobalHeaderCentereddev from 'src/components/global-header/GlobalHeaderCentered.dev';
import * as GlobalHeader from 'src/components/global-header/GlobalHeader';
import * as GlobalFooterDefaultdev from 'src/components/global-footer/GlobalFooterDefault.dev';
import * as GlobalFooterBlueCompactdev from 'src/components/global-footer/GlobalFooterBlueCompact.dev';
import * as GlobalFooterBlueCentereddev from 'src/components/global-footer/GlobalFooterBlueCentered.dev';
import * as GlobalFooterBlackLargedev from 'src/components/global-footer/GlobalFooterBlackLarge.dev';
import * as GlobalFooterBlackCompactdev from 'src/components/global-footer/GlobalFooterBlackCompact.dev';
import * as GlobalFooter from 'src/components/global-footer/GlobalFooter';
import * as FooterNavigationColumndev from 'src/components/global-footer/FooterNavigationColumn.dev';
import * as ZipcodeSearchFormdev from 'src/components/forms/zipcode/ZipcodeSearchForm.dev';
import * as SubmitInfoFormdev from 'src/components/forms/submitinfo/SubmitInfoForm.dev';
import * as EmailSignupFormdev from 'src/components/forms/email/EmailSignupForm.dev';
import * as floatingdockdev from 'src/components/floating-dock/floating-dock.dev';
import * as CtaBanner from 'src/components/cta-banner/CtaBanner';
import * as Testimonials from 'src/components/component-library/Testimonials';
import * as ProductsSection from 'src/components/component-library/ProductsSection';
import * as logocloud from 'src/components/component-library/logo-cloud';
import * as Header from 'src/components/component-library/Header';
import * as FeaturesSection from 'src/components/component-library/FeaturesSection';
import * as FAQ from 'src/components/component-library/FAQ';
import * as ContactSection from 'src/components/component-library/ContactSection';
import * as CLHero from 'src/components/component-library/CLHero';
import * as CallToAction from 'src/components/component-library/CallToAction';
import * as Carousel from 'src/components/carousel/Carousel';
import * as cardspotlightdev from 'src/components/card-spotlight/card-spotlight.dev';
import * as ButtonComponent from 'src/components/button-component/ButtonComponent';
import * as BackgroundThumbnaildev from 'src/components/background-thumbnail/BackgroundThumbnail.dev';
import * as ArticleHeader from 'src/components/article-header/ArticleHeader';
import * as AnimatedSectiondev from 'src/components/animated-section/AnimatedSection.dev';
import * as AlertBannerdev from 'src/components/alert-banner/AlertBanner.dev';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCWrapper],
  ['FEaaSWrapper', FEaaSWrapper],
  ['Form', Form],
  ['zipcode-modal', { ...zipcodemodaldev }],
  ['VerticalImageAccordion', { ...VerticalImageAccordion }],
  ['theme-provider', { ...themeproviderdev }],
  ['TextBannerTextTop', { ...TextBannerTextTopdev }],
  ['TextBannerDefault', { ...TextBannerDefaultdev }],
  ['TextBannerBlueTitleRight', { ...TextBannerBlueTitleRightdev }],
  ['TextBanner02', { ...TextBanner02dev }],
  ['TextBanner01', { ...TextBanner01dev }],
  ['TextBanner', { ...TextBanner }],
  ['TestimonialCarousel', { ...TestimonialCarousel }],
  ['Title', { ...Title }],
  ['PageContent', { ...PageContent }],
  ['Navigation', { ...Navigation }],
  ['LinkList', { ...LinkList }],
  ['Image', { ...Image }],
  ['SubscriptionBanner', { ...SubscriptionBanner }],
  ['SubmissionFormDefault', { ...SubmissionFormDefaultdev }],
  ['SubmissionFormCentered', { ...SubmissionFormCentereddev }],
  ['SubmissionForm', { ...SubmissionForm }],
  ['SlideCarousel', { ...SlideCarouseldev }],
  ['TextSlider', { ...TextSlider }],
  ['ProductPageHeader', { ...ProductPageHeader }],
  ['ProductComparison', { ...ProductComparison }],
  ['MultiPromo', { ...MultiPromo }],
  ['MobileMenuWrapper', { ...MobileMenuWrapper }],
  ['MegaMenuItemWrapper', { ...MegaMenuItemWrapper }],
  ['ImageCarousel', { ...ImageCarousel }],
  ['ImageBanner', { ...ImageBanner }],
  ['HeroST', { ...HeroST }],
  ['FeatureBanner', { ...FeatureBanner }],
  ['AccordionBlock', { ...AccordionBlock }],
  ['SearchBox', { ...SearchBox }],
  ['MiniCart', { ...MiniCart }],
  ['SecondaryNavigation', { ...SecondaryNavigation }],
  ['PromoImage', { ...PromoImage }],
  ['PromoAnimatedImageRight', { ...PromoAnimatedImageRightdev }],
  ['PromoAnimatedDefault', { ...PromoAnimatedDefaultdev }],
  ['PromoAnimated', { ...PromoAnimated }],
  ['ProductListingThreeUp', { ...ProductListingThreeUpdev }],
  ['ProductListingSlider', { ...ProductListingSliderdev }],
  ['ProductListingDefault', { ...ProductListingDefaultdev }],
  ['ProductListing', { ...ProductListing }],
  ['portal', { ...portaldev }],
  ['PageHeaderFiftyFifty', { ...PageHeaderFiftyFiftydev }],
  ['PageHeaderDefault', { ...PageHeaderDefaultdev }],
  ['PageHeaderCentered', { ...PageHeaderCentereddev }],
  ['PageHeaderBlueText', { ...PageHeaderBlueTextdev }],
  ['PageHeaderBlueBackground', { ...PageHeaderBlueBackgrounddev }],
  ['PageHeader', { ...PageHeader }],
  ['MultiPromoTabs', { ...MultiPromoTabs }],
  ['mode-toggle', { ...modetoggledev }],
  ['MediaSection', { ...MediaSectiondev }],
  ['meteors', { ...meteors }],
  ['LogoTabs', { ...LogoTabs }],
  ['LocationSearchTitleZipCentered', { ...LocationSearchTitleZipCentereddev }],
  ['LocationSearchMapTopAllCentered', { ...LocationSearchMapTopAllCentereddev }],
  ['LocationSearchMapRightTitleZipCentered', { ...LocationSearchMapRightTitleZipCentereddev }],
  ['LocationSearchMapRight', { ...LocationSearchMapRightdev }],
  ['LocationSearchItem', { ...LocationSearchItemdev }],
  ['LocationSearchDefault', { ...LocationSearchDefaultdev }],
  ['LocationSearch', { ...LocationSearch }],
  ['GoogleMap', { ...GoogleMapdev }],
  ['ImageGalleryNoSpacing', { ...ImageGalleryNoSpacingdev }],
  ['ImageGalleryGrid', { ...ImageGalleryGriddev }],
  ['ImageGalleryFiftyFifty', { ...ImageGalleryFiftyFiftydev }],
  ['ImageGalleryFeaturedImage', { ...ImageGalleryFeaturedImagedev }],
  ['ImageGallery', { ...ImageGallerydev, ...ImageGallery }],
  ['nextImageSrc', { ...nextImageSrcdev }],
  ['ImageWrapper', { ...ImageWrapperdev }],
  ['image-optimization', { ...imageoptimizationcontext }],
  ['Icon', { ...Icon }],
  ['HeroImageRight', { ...HeroImageRightdev }],
  ['HeroImageBottomInset', { ...HeroImageBottomInsetdev }],
  ['HeroImageBottom', { ...HeroImageBottomdev }],
  ['HeroImageBackground', { ...HeroImageBackgrounddev }],
  ['HeroDefault', { ...HeroDefaultdev }],
  ['Hero', { ...Hero }],
  ['GlobalHeaderDefault', { ...GlobalHeaderDefaultdev }],
  ['GlobalHeaderCentered', { ...GlobalHeaderCentereddev }],
  ['GlobalHeader', { ...GlobalHeader }],
  ['GlobalFooterDefault', { ...GlobalFooterDefaultdev }],
  ['GlobalFooterBlueCompact', { ...GlobalFooterBlueCompactdev }],
  ['GlobalFooterBlueCentered', { ...GlobalFooterBlueCentereddev }],
  ['GlobalFooterBlackLarge', { ...GlobalFooterBlackLargedev }],
  ['GlobalFooterBlackCompact', { ...GlobalFooterBlackCompactdev }],
  ['GlobalFooter', { ...GlobalFooter }],
  ['FooterNavigationColumn', { ...FooterNavigationColumndev }],
  ['ZipcodeSearchForm', { ...ZipcodeSearchFormdev }],
  ['SubmitInfoForm', { ...SubmitInfoFormdev }],
  ['EmailSignupForm', { ...EmailSignupFormdev }],
  ['floating-dock', { ...floatingdockdev }],
  ['CtaBanner', { ...CtaBanner }],
  ['Testimonials', { ...Testimonials }],
  ['ProductsSection', { ...ProductsSection }],
  ['logo-cloud', { ...logocloud }],
  ['Header', { ...Header }],
  ['FeaturesSection', { ...FeaturesSection }],
  ['FAQ', { ...FAQ }],
  ['ContactSection', { ...ContactSection }],
  ['CLHero', { ...CLHero }],
  ['CallToAction', { ...CallToAction }],
  ['Carousel', { ...Carousel }],
  ['card-spotlight', { ...cardspotlightdev }],
  ['ButtonComponent', { ...ButtonComponent }],
  ['BackgroundThumbnail', { ...BackgroundThumbnaildev }],
  ['ArticleHeader', { ...ArticleHeader }],
  ['AnimatedSection', { ...AnimatedSectiondev }],
  ['AlertBanner', { ...AlertBannerdev }],
]);

export default componentMap;
